using TshopperService.Data;

namespace TshopperService.Services;

public interface IItemCategoryService
{
    Task<IEnumerable<ItemCategory>> GetAllItemCategoriesAsync();
    Task<ItemCategory> GetItemCategoryByIdAsync(int id);
    Task<ItemCategory> ToggleItemCategoryAsync(string itemName, int categoryId, bool includeItemName = false);
    Task DeleteItemCategoryAsync(int id);
}