using StackExchange.Redis;
namespace Todo.Api.Services;

public class RedisService : IRedisService
{
    private readonly IConnectionMultiplexer? _redis;
    private const string PublicCachePrefix = "public_todos_";

    public RedisService(IConnectionMultiplexer? redis = null)
    {
        _redis = redis;
    }

    public async Task<string?> GetAsync(string key)
    {
        if (_redis == null) return null;
        try {
            var db = _redis.GetDatabase();
            var val = await db.StringGetAsync(key);
            return val.HasValue ? val.ToString() : null;
        } catch { return null; }
    }

    public async Task SetAsync(string key, string value, TimeSpan ttl)
    {
        if (_redis == null) return;
        try {
            var db = _redis.GetDatabase();
            await db.StringSetAsync(key, value, ttl);
        } catch { }
    }

    public async Task InvalidatePublicCacheAsync()
    {
        if (_redis == null) return;
        try {
            var server = _redis.GetServers().FirstOrDefault();
            if (server != null)
            {
                var keys = server.Keys(pattern: $"{PublicCachePrefix}*").ToArray();
                if (keys.Length > 0)
                    await _redis.GetDatabase().KeyDeleteAsync(keys);
            }
        } catch { }
    }

    public async Task<bool> IsHealthyAsync()
    {
        if (_redis == null) return false;
        try {
            var db = _redis.GetDatabase();
            await db.PingAsync();
            return true;
        } catch { return false; }
    }
}
