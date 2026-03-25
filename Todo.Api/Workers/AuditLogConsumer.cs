using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Todo.Api.Data;
using Todo.Api.Domain.Entities;

namespace Todo.Api.Workers;

public class AuditLogConsumer : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConfiguration _config;
    private readonly ILogger<AuditLogConsumer> _logger;
    private IConnection? _connection;
    private IChannel? _channel;
    private const string ExchangeName = "todo_events";
    private const string QueueName = "audit_log_queue";

    public AuditLogConsumer(IServiceScopeFactory scopeFactory, IConfiguration config, ILogger<AuditLogConsumer> logger)
    {
        _scopeFactory = scopeFactory;
        _config = config;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            var factory = new ConnectionFactory
            {
                HostName = _config["RabbitMq:Host"] ?? "localhost",
                Port = int.Parse(_config["RabbitMq:Port"] ?? "5672"),
                UserName = _config["RabbitMq:Username"] ?? "guest",
                Password = _config["RabbitMq:Password"] ?? "guest"
            };

            _connection = await factory.CreateConnectionAsync(stoppingToken);
            _channel = await _connection.CreateChannelAsync(cancellationToken: stoppingToken);
            await _channel.ExchangeDeclareAsync(ExchangeName, ExchangeType.Fanout, durable: true, cancellationToken: stoppingToken);
            await _channel.QueueDeclareAsync(QueueName, durable: true, exclusive: false, autoDelete: false, cancellationToken: stoppingToken);
            await _channel.QueueBindAsync(QueueName, ExchangeName, string.Empty, cancellationToken: stoppingToken);

            var consumer = new AsyncEventingBasicConsumer(_channel);
            consumer.ReceivedAsync += async (_, ea) =>
            {
                try
                {
                    var body = ea.Body.ToArray();
                    var message = Encoding.UTF8.GetString(body);
                    var evt = JsonSerializer.Deserialize<JsonElement>(message);

                    var auditLog = new AuditLog
                    {
                        EventType = evt.GetProperty("EventType").GetString() ?? "",
                        TodoId = Guid.Parse(evt.GetProperty("TodoId").GetString() ?? Guid.Empty.ToString()),
                        UserId = Guid.Parse(evt.GetProperty("UserId").GetString() ?? Guid.Empty.ToString()),
                        Payload = evt.GetProperty("Payload").GetString() ?? "",
                        OccurredAt = evt.GetProperty("OccurredAt").GetDateTime()
                    };

                    using var scope = _scopeFactory.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    db.AuditLogs.Add(auditLog);
                    await db.SaveChangesAsync(stoppingToken);
                    await _channel.BasicAckAsync(ea.DeliveryTag, false, stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing audit log message.");
                    await _channel.BasicNackAsync(ea.DeliveryTag, false, false, stoppingToken);
                }
            };

            await _channel.BasicConsumeAsync(QueueName, autoAck: false, consumer: consumer, cancellationToken: stoppingToken);
            await Task.Delay(Timeout.Infinite, stoppingToken);
        }
        catch (OperationCanceledException) { }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "AuditLogConsumer could not connect to RabbitMQ. Audit logging disabled.");
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        if (_channel != null) await _channel.CloseAsync(cancellationToken);
        if (_connection != null) await _connection.CloseAsync(cancellationToken);
        await base.StopAsync(cancellationToken);
    }
}
