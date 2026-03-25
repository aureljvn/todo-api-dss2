namespace Todo.Api.Domain.Entities;
public class AuditLog {
    public Guid Id { get; set; } = Guid.NewGuid();
    public string EventType { get; set; } = string.Empty;
    public Guid TodoId { get; set; }
    public Guid UserId { get; set; }
    public string Payload { get; set; } = string.Empty;
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
}
