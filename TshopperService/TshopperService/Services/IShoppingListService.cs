using TshopperService.Data;

namespace TshopperService.Services;

public interface IShoppingListService
{
    Task<List<ShoppingItem>> GetAllItemsAsync(int? storeId);
    Task<ShoppingItem> AddItemAsync(string item, string quantity, int? storeId);
    Task<ShoppingItem> CheckItemAsync(int id);
    Task<ShoppingItem> UncheckItemAsync(int id);
    Task DeleteAllCheckedItemsAsync(int? storeId);
    Task DeleteItemAsync(int id);
    Task<ShoppingItem?> UpdateItemAsync(int id, string item, string quantity);
    Task AddItems(List<ShoppingItem> items);
    Task ReorderItemsAsync(List<int> itemIds, int? storeId);
}
