using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using TshopperService.Data;
using TshopperService.Services;

namespace TshopperService.Hubs;

[Authorize]
public sealed class ShoppingListHub : Hub
{
    private readonly IShoppingListService _shoppingListService;

    public ShoppingListHub(IShoppingListService shoppingListService)
    {
        _shoppingListService = shoppingListService;
    }

    public async Task<List<ShoppingItem>> GetAllItems()
    {
        return await _shoppingListService.GetAllItemsAsync();
    }

    public async Task AddItem(string item, string quantity)
    {
        await _shoppingListService.AddItemAsync(item, quantity);
        await ReceiveUpdate();
    }

    public async Task CheckItem(int id)
    {
        await _shoppingListService.CheckItemAsync(id);
        await ReceiveUpdate();
    }

    public async Task UncheckItem(int id)
    {
        await _shoppingListService.UncheckItemAsync(id);
        await ReceiveUpdate();
    }

    private async Task ReceiveUpdate()
    {
        await Clients.All.SendAsync("ReceiveUpdate", await GetAllItems());
    }

    public async Task DeleteAllCheckedItems()
    {
        await _shoppingListService.DeleteAllCheckedItemsAsync();
        await ReceiveUpdate();
    }
        public async Task UpdateItem(int id, string item, string quantity)
        {
            await _shoppingListService.UpdateItemAsync(id, item, quantity);
            await ReceiveUpdate();
        }

        private async Task ReceiveUpdate()
        {
            await Clients.All.SendAsync("ReceiveUpdate", await GetAllItems());
        }

    public async Task DeleteItem(int id)
    {
        await _shoppingListService.DeleteItemAsync(id);
        await ReceiveUpdate();
    }
}