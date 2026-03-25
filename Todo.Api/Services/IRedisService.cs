namespace Todo.Api.Services;
public interface IRedisService {
    Task<string?> GetAsync(string key);
    Task SetAsync(string key, string value, TimeSpan ttl);
    Task InvalidatePublicCacheAsync();
    Task<bool> IsHealthyAsync();
}
