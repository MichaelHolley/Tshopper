using Microsoft.EntityFrameworkCore;
using TshopperService.Data;

namespace TshopperService;

public class ShoppingListDbContext : DbContext
{
    public DbSet<ShoppingItem> ShoppingList { get; set; }

    public ShoppingListDbContext(DbContextOptions<ShoppingListDbContext> options) : base(options) { }
}