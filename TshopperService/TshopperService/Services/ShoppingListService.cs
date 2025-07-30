using Microsoft.EntityFrameworkCore;
using TshopperService.Data;
using TshopperService.Exceptions;

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
        if (string.IsNullOrWhiteSpace(item))
        {
            throw new BusinessException("Item name cannot be empty", BusinessErrorCodes.INVALID_INPUT);
        }

        var newItem = new ShoppingItem
        {
            Item = item,
            Quantity = quantity
        };

        await _dbContext.ShoppingItems.AddAsync(newItem);
        await _dbContext.SaveChangesAsync();

        return newItem;
    }

    public async Task<ShoppingItem> CheckItemAsync(int id)
    {
        var item = await _dbContext.ShoppingItems.FindAsync(id);

        if (item == null)
        {
            throw new BusinessException($"Shopping item with ID {id} not found", BusinessErrorCodes.NOT_FOUND);
        }

        item.Checked = DateTime.Now;
        await _dbContext.SaveChangesAsync();

        return item;
    }

    public async Task<ShoppingItem> UncheckItemAsync(int id)
    {
        var item = await _dbContext.ShoppingItems.FindAsync(id);

        if (item == null)
        {
            throw new BusinessException($"Shopping item with ID {id} not found", BusinessErrorCodes.NOT_FOUND);
        }

        item.Checked = null;
        await _dbContext.SaveChangesAsync();

        return item;
    }

    public async Task DeleteAllCheckedItemsAsync()
    {
        var items = await _dbContext.ShoppingItems.Where(i => i.Checked != null).ToListAsync();
        if (!items.Any())
        {
            return;
        }

        _dbContext.ShoppingItems.RemoveRange(items);
        await _dbContext.SaveChangesAsync();
    }

    public async Task DeleteItemAsync(int id)
    {
        var item = await _dbContext.ShoppingItems.FindAsync(id);
        if (item == null)
        {
            throw new BusinessException($"Shopping item with ID {id} not found", BusinessErrorCodes.NOT_FOUND);
        }

        _dbContext.ShoppingItems.Remove(item);
        await _dbContext.SaveChangesAsync();
    }
    
    public async Task<ShoppingItem?> UpdateItemAsync(int id, string item, string quantity)
    {
        var existingItem = await _dbContext.ShoppingItems.FindAsync(id);
        if (existingItem == null)
        {
            return null;
        }
            
        existingItem.Item = item;
        existingItem.Quantity = quantity;
        await _dbContext.SaveChangesAsync();
            
        return existingItem;
    }

    public async Task AddItems(List<ShoppingItem> items)
    {
        _dbContext.ShoppingItems.AddRange(items);
        _dbContext.SaveChangesAsync();
    }
}