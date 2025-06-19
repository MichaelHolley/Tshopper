using TshopperService.Data;

namespace TshopperService.Services
{
    public interface IShoppingListService
    {
        Task<List<ShoppingItem>> GetAllItemsAsync();
        Task<ShoppingItem> AddItemAsync(string item, string quantity);
        Task<ShoppingItem?> CheckItemAsync(int id);
        Task<ShoppingItem?> UncheckItemAsync(int id);
        Task DeleteAllCheckedItemsAsync();
        Task DeleteItemAsync(int id);
        Task<ShoppingItem?> UpdateItemAsync(int id, string item, string quantity);
    }
}