using System.Text.Json;
using Todo.Api.Services;

namespace Todo.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (status, title) = exception switch
        {
            ConflictException => (409, "Conflict"),
            UnauthorizedException => (401, "Unauthorized"),
            ForbiddenException => (403, "Forbidden"),
            NotFoundException => (404, "Not Found"),
            ArgumentException => (400, "Validation failed"),
            _ => (500, "Internal Server Error")
        };

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = status;

        var problem = new
        {
            type = $"https://httpstatuses.com/{status}",
            title,
            status,
            detail = exception.Message
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(problem));
    }
}
