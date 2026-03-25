namespace Todo.Api.DTOs.Todos;
public class TodoQueryParams {
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string Status { get; set; } = "all";
    public string? Priority { get; set; }
    public string? DueFrom { get; set; }
    public string? DueTo { get; set; }
    public string SortBy { get; set; } = "createdAt";
    public string SortDir { get; set; } = "desc";
    public string? Search { get; set; }
}
