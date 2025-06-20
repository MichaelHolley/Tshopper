using Microsoft.EntityFrameworkCore;
using TshopperService.Data;

namespace TshopperService;

public class ShoppingListDbContext : DbContext
{
    public DbSet<ShoppingItem> ShoppingItems { get; set; }
    public DbSet<Category> Categories { get; set; }
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

        modelBuilder.Entity<Category>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.Name).IsRequired();
            e.HasMany(i => i.ItemCategories)
                .WithOne(c => c.Category)
                .HasForeignKey(c => c.CategoryId);
        });

        modelBuilder.Entity<ItemCategory>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.ItemName).IsRequired();
            e.HasOne(i => i.Category)
                .WithMany(c => c.ItemCategories)
                .HasForeignKey(i => i.CategoryId)
                .IsRequired();
        });
    }
}