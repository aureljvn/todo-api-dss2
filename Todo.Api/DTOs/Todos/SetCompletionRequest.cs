using System.ComponentModel.DataAnnotations;
namespace Todo.Api.DTOs.Todos;
public class SetCompletionRequest {
    [Required] public bool IsCompleted { get; set; }
}
