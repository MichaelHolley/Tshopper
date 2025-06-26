using TshopperService.Data;

namespace TshopperService.Services;

public interface IItemCategoryService
{
    Task<IEnumerable<ItemCategory>> GetAllItemCategoriesAsync();
    Task<ItemCategory> GetItemCategoryByIdAsync(int id);
    Task<ItemCategory> AddItemCategoryAsync(string itemName, int categoryId, bool includeItemName);
    Task<ItemCategory> UpdateItemCategoryAsync(int id, string itemName, int categoryId, bool includeItemName);
    Task DeleteItemCategoryAsync(int id);
}