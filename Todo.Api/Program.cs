using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using StackExchange.Redis;
using Todo.Api.Data;
using Todo.Api.Middleware;
using Todo.Api.Services;
using Todo.Api.Workers;

var builder = WebApplication.CreateBuilder(args);

// DB — accepte "Default" (e2e prof) ou "DefaultConnection" (notre config)
var connStr = builder.Configuration.GetConnectionString("Default")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("No connection string configured");
builder.Services.AddDbContext<AppDbContext>(opts =>
    opts.UseNpgsql(connStr, o => o.EnableRetryOnFailure(
        maxRetryCount: 10,
        maxRetryDelay: TimeSpan.FromSeconds(3),
        errorCodesToAdd: null)));

// JWT Auth — issuer/audience validés seulement s'ils sont configurés
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

// HS256 requires a minimum of 256 bits (32 bytes) — pad with zeros if shorter
var jwtKeyBytes = Encoding.UTF8.GetBytes(jwtKey);
if (jwtKeyBytes.Length < 32) Array.Resize(ref jwtKeyBytes, 32);
var signingKey = new SymmetricSecurityKey(jwtKeyBytes);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = !string.IsNullOrEmpty(jwtIssuer),
            ValidateAudience = !string.IsNullOrEmpty(jwtAudience),
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = signingKey
        };
    });

builder.Services.AddAuthorization();

// Redis (optional, graceful degradation)
try
{
    var redisConnStr = builder.Configuration["Redis:ConnectionString"] ?? "localhost:6379";
    var redis = ConnectionMultiplexer.Connect(redisConnStr);
    builder.Services.AddSingleton<IConnectionMultiplexer>(redis);
    builder.Services.AddSingleton<IRedisService, RedisService>(sp => new RedisService(sp.GetRequiredService<IConnectionMultiplexer>()));
}
catch (RedisConnectionException)
{
    builder.Services.AddSingleton<IRedisService, RedisService>(_ => new RedisService());
}
catch
{
    builder.Services.AddSingleton<IRedisService, RedisService>(_ => new RedisService());
}

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<IRabbitMqService, RabbitMqService>();
builder.Services.AddScoped<ITodoService, TodoService>();
builder.Services.AddHostedService<AuditLogConsumer>();

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Todo API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter your JWT token",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(_ => new OpenApiSecurityRequirement {
        {
            new OpenApiSecuritySchemeReference("Bearer"),
            []
        }
    });
});

// CORS
builder.Services.AddCors(opts =>
    opts.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

// Migrate DB in background after HTTP server starts listening — avoids ECONNREFUSED race
// with Cypress/frontend on cached Docker runs where all containers start simultaneously.
app.Lifetime.ApplicationStarted.Register(() =>
{
    _ = Task.Run(async () =>
    {
        var retries = 0;
        while (true)
        {
            try
            {
                using var scope = app.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                await db.Database.MigrateAsync();
                Console.WriteLine("Database migration completed successfully.");
                break;
            }
            catch (Exception ex) when (retries < 10)
            {
                retries++;
                Console.Error.WriteLine($"DB not ready (attempt {retries}/10): {ex.Message}. Retrying in 3s...");
                await Task.Delay(3000);
            }
        }
    });
});

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
