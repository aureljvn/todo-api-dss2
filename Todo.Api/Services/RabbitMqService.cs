using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
namespace Todo.Api.Services;

public class RabbitMqService : IRabbitMqService, IDisposable
{
    private IConnection? _connection;
    private IChannel? _channel;
    private const string ExchangeName = "todo_events";
    private bool _disposed;

    public RabbitMqService(IConfiguration config)
    {
        try
        {
            var factory = new ConnectionFactory
            {
                HostName = config["RabbitMq:Host"] ?? "localhost",
                Port = int.Parse(config["RabbitMq:Port"] ?? "5672"),
                UserName = config["RabbitMq:Username"] ?? "guest",
                Password = config["RabbitMq:Password"] ?? "guest"
            };
            _connection = factory.CreateConnectionAsync().GetAwaiter().GetResult();
            _channel = _connection.CreateChannelAsync().GetAwaiter().GetResult();
            _channel.ExchangeDeclareAsync(ExchangeName, ExchangeType.Fanout, durable: true).GetAwaiter().GetResult();
        }
        catch { /* RabbitMQ not available, degrade gracefully */ }
    }

    public async Task PublishAsync(string eventType, Guid todoId, Guid userId, string payload)
    {
        if (_channel == null) return;
        try
        {
            var message = JsonSerializer.Serialize(new { EventType = eventType, TodoId = todoId, UserId = userId, Payload = payload, OccurredAt = DateTime.UtcNow });
            var body = Encoding.UTF8.GetBytes(message);
            var props = new BasicProperties { Persistent = true };
            await _channel.BasicPublishAsync(ExchangeName, string.Empty, false, props, new ReadOnlyMemory<byte>(body));
        }
        catch { }
    }

    public bool IsHealthy() => _connection?.IsOpen == true;

    public void Dispose()
    {
        if (_disposed) return;
        _channel?.CloseAsync().GetAwaiter().GetResult();
        _connection?.CloseAsync().GetAwaiter().GetResult();
        _channel?.DisposeAsync().AsTask().GetAwaiter().GetResult();
        _connection?.DisposeAsync().AsTask().GetAwaiter().GetResult();
        _disposed = true;
    }
}
