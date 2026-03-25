namespace Todo.Api.DTOs.Auth;
public class LoginResponse {
    public string AccessToken { get; set; } = string.Empty;
    public string TokenType { get; set; } = "Bearer";
    public int ExpiresInSeconds { get; set; } = 3600;
    public AuthUserResponse User { get; set; } = null!;
}
