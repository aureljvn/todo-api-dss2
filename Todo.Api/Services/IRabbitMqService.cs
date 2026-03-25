namespace Todo.Api.Services;
public interface IRabbitMqService {
    Task PublishAsync(string eventType, Guid todoId, Guid userId, string payload);
    bool IsHealthy();
}
