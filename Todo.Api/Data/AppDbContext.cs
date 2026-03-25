using Microsoft.EntityFrameworkCore;
using Todo.Api.Domain.Entities;
using Todo.Api.Domain.Enums;

namespace Todo.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<TodoItem> Todos => Set<TodoItem>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e => {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Email).HasMaxLength(254).IsRequired();
            e.Property(x => x.PasswordHash).IsRequired();
            e.Property(x => x.DisplayName).HasMaxLength(100);
        });

        modelBuilder.Entity<TodoItem>(e => {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(100).IsRequired();
            e.Property(x => x.Details).HasMaxLength(1000);
            e.Property(x => x.Priority).HasConversion<string>().IsRequired();
            e.HasOne(x => x.User).WithMany(u => u.Todos).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AuditLog>(e => {
            e.HasKey(x => x.Id);
        });
    }
}
