using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Todo.Api.DTOs.Todos;
using Todo.Api.Services;

namespace Todo.Api.Controllers;

[ApiController]
[Route("api/todos")]
public class TodosController : ControllerBase
{
    private readonly ITodoService _todoService;

    public TodosController(ITodoService todoService)
    {
        _todoService = todoService;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? throw new UnauthorizedException("User not authenticated."));

    [HttpGet("public")]
    [ProducesResponseType(typeof(PagedResponse<TodoResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPublicTodos([FromQuery] TodoQueryParams query)
    {
        if (query.Page < 1 || query.PageSize < 1 || query.PageSize > 50)
            return ValidationProblem("page must be >= 1 and pageSize must be between 1 and 50.");
        var result = await _todoService.GetPublicTodosAsync(query);
        return Ok(result);
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(PagedResponse<TodoResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetTodos([FromQuery] TodoQueryParams query)
    {
        if (query.Page < 1 || query.PageSize < 1 || query.PageSize > 50)
            return ValidationProblem("page must be >= 1 and pageSize must be between 1 and 50.");
        var result = await _todoService.GetUserTodosAsync(GetUserId(), query);
        return Ok(result);
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(TodoResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateTodo([FromBody] CreateTodoRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var result = await _todoService.CreateAsync(GetUserId(), request);
        return CreatedAtAction(nameof(GetTodoById), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(TodoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTodoById(Guid id)
    {
        var result = await _todoService.GetByIdAsync(id, GetUserId());
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(TodoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTodo(Guid id, [FromBody] UpdateTodoRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var result = await _todoService.UpdateAsync(id, GetUserId(), request);
        return Ok(result);
    }

    [HttpPatch("{id:guid}/completion")]
    [Authorize]
    [ProducesResponseType(typeof(TodoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetCompletion(Guid id, [FromBody] SetCompletionRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var result = await _todoService.SetCompletionAsync(id, GetUserId(), request);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTodo(Guid id)
    {
        await _todoService.DeleteAsync(id, GetUserId());
        return NoContent();
    }
}
