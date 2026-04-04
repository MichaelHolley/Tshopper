using Microsoft.EntityFrameworkCore;
using TshopperService.Data;

namespace TshopperService;

public class ShoppingListDbContext : DbContext
{
    public DbSet<ShoppingItem> ShoppingItems { get; set; }
    public DbSet<Store> Stores { get; set; }
    public DbSet<UserPreference> UserPreferences { get; set; }

    public ShoppingListDbContext(DbContextOptions<ShoppingListDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ShoppingItem>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.Item).IsRequired();
            e.HasOne(i => i.Store)
                .WithMany(s => s.Items)
                .HasForeignKey(i => i.StoreId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Store>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.Name).IsRequired();
            e.Property(s => s.Color).IsRequired();
        });

        modelBuilder.Entity<UserPreference>(e =>
        {
            e.HasKey(p => p.Id);
            e.HasOne(p => p.DefaultStore)
                .WithMany()
                .HasForeignKey(p => p.DefaultStoreId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
