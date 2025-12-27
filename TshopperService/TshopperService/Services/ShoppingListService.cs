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
            .ThenBy(i => i.SortOrder)
            .ThenByDescending(i => i.Checked)
            .ToListAsync();
    }

    public async Task<ShoppingItem> AddItemAsync(string item, string quantity)
    {
        if (string.IsNullOrWhiteSpace(item))
        {
            throw new BusinessException("Item name cannot be empty", BusinessErrorCodes.INVALID_INPUT);
        }

        // Get max SortOrder from unchecked items
        var maxSortOrder = await _dbContext.ShoppingItems
            .Where(i => i.Checked == null)
            .MaxAsync(i => (int?)i.SortOrder) ?? 0;

        var newItem = new ShoppingItem
        {
            Item = item,
            Quantity = quantity,
            SortOrder = maxSortOrder + 1
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

        // Set SortOrder to max + 1 to add to bottom of unchecked list
        var maxSortOrder = await _dbContext.ShoppingItems
            .Where(i => i.Checked == null && i.Id != id)
            .MaxAsync(i => (int?)i.SortOrder) ?? 0;

        item.SortOrder = maxSortOrder + 1;

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
        await _dbContext.SaveChangesAsync();
    }

    public async Task ReorderItemsAsync(List<int> itemIds)
    {
        if (itemIds == null || !itemIds.Any())
        {
            throw new BusinessException("Item IDs list cannot be empty", BusinessErrorCodes.INVALID_INPUT);
        }

        var items = await _dbContext.ShoppingItems
            .Where(i => itemIds.Contains(i.Id))
            .ToListAsync();

        if (items.Count != itemIds.Count)
        {
            throw new BusinessException("One or more items not found", BusinessErrorCodes.NOT_FOUND);
        }

        // Check that all items are unchecked
        var checkedItems = items.Where(i => i.Checked != null).ToList();
        if (checkedItems.Any())
        {
            throw new BusinessException("Cannot reorder checked items", BusinessErrorCodes.INVALID_INPUT);
        }

        // Update SortOrder based on position in the list
        for (int i = 0; i < itemIds.Count; i++)
        {
            var item = items.First(x => x.Id == itemIds[i]);
            item.SortOrder = i + 1;
        }

        await _dbContext.SaveChangesAsync();
    }

    public async Task ResetSortOrderAsync()
    {
        var uncheckedItems = await _dbContext.ShoppingItems
            .Where(i => i.Checked == null)
            .OrderBy(i => i.Item)
            .ToListAsync();

        for (int i = 0; i < uncheckedItems.Count; i++)
        {
            uncheckedItems[i].SortOrder = i + 1;
        }

        await _dbContext.SaveChangesAsync();
    }
}