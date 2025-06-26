using Microsoft.EntityFrameworkCore;
using TshopperService.Data;
using TshopperService.Exceptions;

namespace TshopperService.Services;

public class ItemCategoryService : IItemCategoryService
{
    private readonly ShoppingListDbContext _context;

    public ItemCategoryService(ShoppingListDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ItemCategory>> GetAllItemCategoriesAsync()
    {
        return await _context.ItemCategories.Include(ic => ic.Category).ToListAsync();
    }

    public async Task<ItemCategory> GetItemCategoryByIdAsync(int id)
    {
        var itemCategory = await _context.ItemCategories
            .Include(ic => ic.Category)
            .FirstOrDefaultAsync(ic => ic.Id == id);

        if (itemCategory == null)
        {
            throw new BusinessException($"ItemCategory with ID {id} not found.");
        }

        return itemCategory;
    }

    public async Task<ItemCategory> AddItemCategoryAsync(string itemName, int categoryId, bool includeItemName)
    {
        var category = await _context.Categories.FindAsync(categoryId);
        if (category == null)
        {
            throw new BusinessException($"Category with ID {categoryId} not found.");
        }

        var itemCategory = new ItemCategory
        {
            ItemName = itemName,
            CategoryId = categoryId,
            Category = category,
            IncludeItemName = includeItemName
        };
        
        _context.ItemCategories.Add(itemCategory);
        await _context.SaveChangesAsync();
        return itemCategory;
    }

    public async Task<ItemCategory> UpdateItemCategoryAsync(int id, string itemName, int categoryId,
        bool includeItemName)
    {
        var itemCategory = await _context.ItemCategories.FindAsync(id);
        if (itemCategory == null)
        {
            throw new BusinessException($"ItemCategory with ID {id} not found.");
        }

        var category = await _context.Categories.FindAsync(categoryId);
        if (category == null)
        {
            throw new BusinessException($"Category with ID {categoryId} not found.");
        }

        itemCategory.ItemName = itemName;
        itemCategory.CategoryId = categoryId;
        itemCategory.Category = category;
        itemCategory.IncludeItemName = includeItemName;

        _context.ItemCategories.Update(itemCategory);
        await _context.SaveChangesAsync();
        return itemCategory;
    }

    public async Task DeleteItemCategoryAsync(int id)
    {
        var itemCategory = await _context.ItemCategories.FindAsync(id);
        if (itemCategory == null)
        {
            throw new BusinessException($"ItemCategory with ID {id} not found.");
        }

        _context.ItemCategories.Remove(itemCategory);
        await _context.SaveChangesAsync();
    }
}