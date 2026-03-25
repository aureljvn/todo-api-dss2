using Todo.Api.DTOs.Auth;
namespace Todo.Api.Services;
public interface IAuthService {
    Task<AuthUserResponse> RegisterAsync(RegisterRequest request);
    Task<LoginResponse> LoginAsync(LoginRequest request);
}
