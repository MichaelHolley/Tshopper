using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using TshopperService.Data;
using TshopperService.Exceptions;
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

    public async Task<List<ShoppingItem>> GetAllItems(int? storeId)
    {
        return await _shoppingListService.GetAllItemsAsync(storeId);
    }

    public async Task AddItem(string item, string quantity, int? storeId)
    {
        try
        {
            await _shoppingListService.AddItemAsync(item, quantity, storeId);
            await ReceiveUpdate(storeId);
        }
        catch (BusinessException ex)
        {
            throw new HubException($"{ex.Code}: {ex.Message}");
        }
    }

    public async Task CheckItem(int id)
    {
        try
        {
            var updatedItem = await _shoppingListService.CheckItemAsync(id);
            await ReceiveUpdate(updatedItem.StoreId);
        }
        catch (BusinessException ex)
        {
            throw new HubException($"{ex.Code}: {ex.Message}");
        }
    }

    public async Task UncheckItem(int id)
    {
        try
        {
            var updatedItem = await _shoppingListService.UncheckItemAsync(id);
            await ReceiveUpdate(updatedItem.StoreId);
        }
        catch (BusinessException ex)
        {
            throw new HubException($"{ex.Code}: {ex.Message}");
        }
    }

    private async Task ReceiveUpdate(int? storeId)
    {
        var items = await _shoppingListService.GetAllItemsAsync(storeId);
        await Clients.All.SendAsync("ReceiveUpdate", storeId, items);
    }

    public async Task DeleteAllCheckedItems(int? storeId)
    {
        try
        {
            await _shoppingListService.DeleteAllCheckedItemsAsync(storeId);
            await ReceiveUpdate(storeId);
        }
        catch (BusinessException ex)
        {
            throw new HubException($"{ex.Code}: {ex.Message}");
        }
    }

    public async Task UpdateItem(int id, string item, string quantity)
    {
        var updatedItem = await _shoppingListService.UpdateItemAsync(id, item, quantity);
        if (updatedItem != null)
        {
            await ReceiveUpdate(updatedItem.StoreId);
        }
    }

    public async Task DeleteItem(int id, int? storeId)
    {
        try
        {
            await _shoppingListService.DeleteItemAsync(id);
            await ReceiveUpdate(storeId);
        }
        catch (BusinessException ex)
        {
            throw new HubException($"{ex.Code}: {ex.Message}");
        }
    }

    public async Task ReorderItems(List<int> itemIds, int? storeId)
    {
        try
        {
            await _shoppingListService.ReorderItemsAsync(itemIds, storeId);
            await ReceiveUpdate(storeId);
        }
        catch (BusinessException ex)
        {
            throw new HubException($"{ex.Code}: {ex.Message}");
        }
    }
}
