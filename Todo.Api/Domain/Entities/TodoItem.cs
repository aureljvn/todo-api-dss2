using Todo.Api.Domain.Enums;
namespace Todo.Api.Domain.Entities;
public class TodoItem {
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Details { get; set; }
    public Priority Priority { get; set; } = Priority.Medium;
    public DateOnly? DueDate { get; set; }
    public bool IsCompleted { get; set; } = false;
    public bool IsPublic { get; set; } = false;
    public DateTime CreatedAt { get; set; } = TruncateToSecond(DateTime.UtcNow);
    public DateTime UpdatedAt { get; set; } = TruncateToSecond(DateTime.UtcNow);

    private static DateTime TruncateToSecond(DateTime dt)
    {
        var ticks = dt.Ticks;
        return new DateTime(ticks - ticks % TimeSpan.TicksPerSecond, dt.Kind);
    }
    public User User { get; set; } = null!;
}
