using Todo.Api.DTOs.Todos;
namespace Todo.Api.Services;
public interface ITodoService {
    Task<PagedResponse<TodoResponse>> GetPublicTodosAsync(TodoQueryParams query);
    Task<PagedResponse<TodoResponse>> GetUserTodosAsync(Guid userId, TodoQueryParams query);
    Task<TodoResponse> GetByIdAsync(Guid id, Guid userId);
    Task<TodoResponse> CreateAsync(Guid userId, CreateTodoRequest request);
    Task<TodoResponse> UpdateAsync(Guid id, Guid userId, UpdateTodoRequest request);
    Task<TodoResponse> SetCompletionAsync(Guid id, Guid userId, SetCompletionRequest request);
    Task DeleteAsync(Guid id, Guid userId);
}
