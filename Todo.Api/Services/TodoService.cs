using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Todo.Api.Data;
using Todo.Api.Domain.Entities;
using Todo.Api.Domain.Enums;
using Todo.Api.DTOs.Todos;

namespace Todo.Api.Services;

public class TodoService : ITodoService
{
    private readonly AppDbContext _db;
    private readonly IRabbitMqService _rabbitMq;
    private readonly IRedisService _redis;

    public TodoService(AppDbContext db, IRabbitMqService rabbitMq, IRedisService redis)
    {
        _db = db;
        _rabbitMq = rabbitMq;
        _redis = redis;
    }

    public async Task<PagedResponse<TodoResponse>> GetPublicTodosAsync(TodoQueryParams query)
    {
        var cacheKey = $"public_todos_{JsonSerializer.Serialize(query)}";
        var cached = await _redis.GetAsync(cacheKey);
        if (cached != null)
            return JsonSerializer.Deserialize<PagedResponse<TodoResponse>>(cached)!;

        var q = _db.Todos.Where(t => t.IsPublic).AsQueryable();
        q = ApplyFilters(q, query);
        q = ApplySort(q, query);

        var total = await q.CountAsync();
        var items = await q.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToListAsync();

        var result = new PagedResponse<TodoResponse>
        {
            Items = items.Select(MapToResponse),
            Page = query.Page,
            PageSize = query.PageSize,
            TotalItems = total,
            TotalPages = (int)Math.Ceiling((double)total / query.PageSize)
        };

        await _redis.SetAsync(cacheKey, JsonSerializer.Serialize(result), TimeSpan.FromSeconds(60));
        return result;
    }

    public async Task<PagedResponse<TodoResponse>> GetUserTodosAsync(Guid userId, TodoQueryParams query)
    {
        var q = _db.Todos.Where(t => t.UserId == userId).AsQueryable();
        q = ApplyFilters(q, query);
        q = ApplySort(q, query);

        var total = await q.CountAsync();
        var items = await q.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToListAsync();

        return new PagedResponse<TodoResponse>
        {
            Items = items.Select(MapToResponse),
            Page = query.Page,
            PageSize = query.PageSize,
            TotalItems = total,
            TotalPages = (int)Math.Ceiling((double)total / query.PageSize)
        };
    }

    public async Task<TodoResponse> GetByIdAsync(Guid id, Guid userId)
    {
        var todo = await _db.Todos.FindAsync(id) ?? throw new NotFoundException("Todo not found.");
        if (todo.UserId != userId) throw new ForbiddenException("Access denied.");
        return MapToResponse(todo);
    }

    public async Task<TodoResponse> CreateAsync(Guid userId, CreateTodoRequest request)
    {
        ValidateDueDate(request.DueDate);
        var priority = ParsePriority(request.Priority);

        var todo = new TodoItem
        {
            UserId = userId,
            Title = request.Title,
            Details = request.Details,
            Priority = priority,
            DueDate = request.DueDate != null ? DateOnly.Parse(request.DueDate) : null,
            IsPublic = request.IsPublic
        };

        _db.Todos.Add(todo);
        await _db.SaveChangesAsync();

        await _rabbitMq.PublishAsync("TodoCreated", todo.Id, userId, JsonSerializer.Serialize(MapToResponse(todo)));
        await _redis.InvalidatePublicCacheAsync();

        return MapToResponse(todo);
    }

    public async Task<TodoResponse> UpdateAsync(Guid id, Guid userId, UpdateTodoRequest request)
    {
        var todo = await _db.Todos.FindAsync(id) ?? throw new NotFoundException("Todo not found.");
        if (todo.UserId != userId) throw new ForbiddenException("Access denied.");

        ValidateDueDate(request.DueDate);
        var priority = ParsePriority(request.Priority);

        todo.Title = request.Title;
        todo.Details = request.Details;
        todo.Priority = priority;
        todo.DueDate = request.DueDate != null ? DateOnly.Parse(request.DueDate) : null;
        todo.IsPublic = request.IsPublic;
        todo.IsCompleted = request.IsCompleted;
        todo.UpdatedAt = TruncateToSecond(DateTime.UtcNow);

        await _db.SaveChangesAsync();

        await _rabbitMq.PublishAsync("TodoUpdated", todo.Id, userId, JsonSerializer.Serialize(MapToResponse(todo)));
        await _redis.InvalidatePublicCacheAsync();

        return MapToResponse(todo);
    }

    public async Task<TodoResponse> SetCompletionAsync(Guid id, Guid userId, SetCompletionRequest request)
    {
        var todo = await _db.Todos.FindAsync(id) ?? throw new NotFoundException("Todo not found.");
        if (todo.UserId != userId) throw new ForbiddenException("Access denied.");

        todo.IsCompleted = request.IsCompleted;
        todo.UpdatedAt = TruncateToSecond(DateTime.UtcNow);
        await _db.SaveChangesAsync();

        await _rabbitMq.PublishAsync("TodoCompleted", todo.Id, userId, JsonSerializer.Serialize(MapToResponse(todo)));
        await _redis.InvalidatePublicCacheAsync();

        return MapToResponse(todo);
    }

    public async Task DeleteAsync(Guid id, Guid userId)
    {
        var todo = await _db.Todos.FindAsync(id) ?? throw new NotFoundException("Todo not found.");
        if (todo.UserId != userId) throw new ForbiddenException("Access denied.");

        _db.Todos.Remove(todo);
        await _db.SaveChangesAsync();

        await _rabbitMq.PublishAsync("TodoDeleted", todo.Id, userId, JsonSerializer.Serialize(new { id = todo.Id }));
        await _redis.InvalidatePublicCacheAsync();
    }

    private static IQueryable<TodoItem> ApplyFilters(IQueryable<TodoItem> q, TodoQueryParams query)
    {
        if (query.Status == "active") q = q.Where(t => !t.IsCompleted);
        else if (query.Status == "completed") q = q.Where(t => t.IsCompleted);

        if (!string.IsNullOrEmpty(query.Priority))
        {
            var p = ParsePriority(query.Priority);
            q = q.Where(t => t.Priority == p);
        }

        if (!string.IsNullOrEmpty(query.DueFrom))
        {
            var d = DateOnly.Parse(query.DueFrom);
            q = q.Where(t => t.DueDate >= d);
        }

        if (!string.IsNullOrEmpty(query.DueTo))
        {
            var d = DateOnly.Parse(query.DueTo);
            q = q.Where(t => t.DueDate <= d);
        }

        if (!string.IsNullOrEmpty(query.Search))
        {
            var s = query.Search.ToLower();
            q = q.Where(t => t.Title.ToLower().Contains(s) || (t.Details != null && t.Details.ToLower().Contains(s)));
        }

        return q;
    }

    private static IQueryable<TodoItem> ApplySort(IQueryable<TodoItem> q, TodoQueryParams query)
    {
        bool asc = query.SortDir.ToLower() == "asc";
        return query.SortBy.ToLower() switch
        {
            "duedate" => asc ? q.OrderBy(t => t.DueDate) : q.OrderByDescending(t => t.DueDate),
            "priority" => asc ? q.OrderBy(t => t.Priority) : q.OrderByDescending(t => t.Priority),
            "title" => asc ? q.OrderBy(t => t.Title) : q.OrderByDescending(t => t.Title),
            _ => asc ? q.OrderBy(t => t.CreatedAt) : q.OrderByDescending(t => t.CreatedAt)
        };
    }

    private static TodoResponse MapToResponse(TodoItem t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Details = t.Details,
        Priority = t.Priority.ToString().ToLower(),
        DueDate = t.DueDate?.ToString("yyyy-MM-dd"),
        IsCompleted = t.IsCompleted,
        IsPublic = t.IsPublic,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt
    };

    private static Priority ParsePriority(string p) => p.ToLower() switch
    {
        "low" => Priority.Low,
        "medium" => Priority.Medium,
        "high" => Priority.High,
        _ => throw new ArgumentException($"Invalid priority: {p}")
    };

    private static DateTime TruncateToSecond(DateTime dt)
    {
        var ticks = dt.Ticks;
        return new DateTime(ticks - ticks % TimeSpan.TicksPerSecond, dt.Kind);
    }

    private static void ValidateDueDate(string? dueDate)
    {
        if (!string.IsNullOrEmpty(dueDate) && !DateOnly.TryParse(dueDate, out _))
            throw new ArgumentException("Invalid dueDate format. Expected YYYY-MM-DD.");
    }
}
