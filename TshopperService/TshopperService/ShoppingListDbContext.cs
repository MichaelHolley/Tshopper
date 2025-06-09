using Microsoft.EntityFrameworkCore;
using TshopperService.Data;

namespace TshopperService;

public class ShoppingListDbContext : DbContext
{
    public DbSet<ShoppingItem> ShoppingList { get; set; }
    public DbSet<ItemCategory> ItemCategories { get; set; }

    public ShoppingListDbContext(DbContextOptions<ShoppingListDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ShoppingItem>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.Item).IsRequired();
        });

        modelBuilder.Entity<ItemCategory>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.Category).IsRequired();
            e.Property(i => i.ItemName).IsRequired();
            e.Property(i => i.Category).IsRequired();
            // todo has one...
        });
    }
}