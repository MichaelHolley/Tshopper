using Microsoft.EntityFrameworkCore;
using TshopperService.Data;

namespace TshopperService.Services;

public class ShoppingListService : IShoppingListService
{
    private readonly ShoppingListDbContext _dbContext;

    public ShoppingListService(ShoppingListDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ShoppingItem>> GetAllItemsAsync()
    {
        return await _dbContext.ShoppingItems
            .Where(i => i.Checked == null || i.Checked > DateTime.Now.AddDays(-7))
            .OrderBy(i => i.Checked != null)
            .ThenByDescending(i => i.Checked)
            .ThenBy(i => i.Item)
            .ToListAsync();
    }

    public async Task<ShoppingItem> AddItemAsync(string item, string quantity)
    {
        var newItem = new ShoppingItem
        {
            Item = item,
            Quantity = quantity
        };

        await _dbContext.ShoppingItems.AddAsync(newItem);
        await _dbContext.SaveChangesAsync();

        return newItem;
    }

    public async Task<ShoppingItem?> CheckItemAsync(int id)
    {
        var item = await _dbContext.ShoppingItems.FindAsync(id);

        if (item == null)
        {
            return null;
        }

        item.Checked = DateTime.Now;
        await _dbContext.SaveChangesAsync();

        return item;
    }

    public async Task<ShoppingItem?> UncheckItemAsync(int id)
    {
        var item = await _dbContext.ShoppingItems.FindAsync(id);

        if (item == null)
        {
            return null;
        }

        item.Checked = null;
        await _dbContext.SaveChangesAsync();

        return item;
    }

    public async Task DeleteAllCheckedItemsAsync()
    {
        var items = await _dbContext.ShoppingItems.Where(i => i.Checked != null).ToListAsync();
        _dbContext.ShoppingItems.RemoveRange(items);
        await _dbContext.SaveChangesAsync();
    }

    public async Task DeleteItemAsync(int id)
    {
        var item = await _dbContext.ShoppingItems.FindAsync(id);
        if (item != null)
        {
            _dbContext.ShoppingItems.Remove(item);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<ShoppingItem?> UpdateItemAsync(int id, string item, string quantity)
        {
            var existingItem = await _dbContext.ShoppingList.FindAsync(id);
            if (existingItem == null)
            {
                return null;
            }
            
            existingItem.Item = item;
            existingItem.Quantity = quantity;
            await _dbContext.SaveChangesAsync();
            
            return existingItem;
        }
    }
}