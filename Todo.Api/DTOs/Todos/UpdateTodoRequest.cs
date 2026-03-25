using System.ComponentModel.DataAnnotations;
namespace Todo.Api.DTOs.Todos;
public class UpdateTodoRequest {
    [Required][MinLength(3)][MaxLength(100)] public string Title { get; set; } = string.Empty;
    [MaxLength(1000)] public string? Details { get; set; }
    [Required][RegularExpression("^(low|medium|high)$", ErrorMessage = "Priority must be low, medium, or high.")] public string Priority { get; set; } = string.Empty;
    public string? DueDate { get; set; }
    public bool IsPublic { get; set; } = false;
    public bool IsCompleted { get; set; } = false;
}
