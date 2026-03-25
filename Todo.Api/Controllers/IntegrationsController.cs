using Microsoft.AspNetCore.Mvc;
using Todo.Api.Services;

namespace Todo.Api.Controllers;

[ApiController]
[Route("api/integrations")]
public class IntegrationsController : ControllerBase
{
    private readonly IRedisService _redis;
    private readonly IRabbitMqService _rabbitMq;

    public IntegrationsController(IRedisService redis, IRabbitMqService rabbitMq)
    {
        _redis = redis;
        _rabbitMq = rabbitMq;
    }

    [HttpGet("redis/health")]
    public async Task<IActionResult> RedisHealth()
    {
        var healthy = await _redis.IsHealthyAsync();
        return healthy ? Ok(new { status = "connected" }) : StatusCode(503, new { status = "disconnected" });
    }

    [HttpGet("rabbitmq/health")]
    public IActionResult RabbitMqHealth()
    {
        var healthy = _rabbitMq.IsHealthy();
        return healthy ? Ok(new { status = "connected" }) : StatusCode(503, new { status = "disconnected" });
    }
}
