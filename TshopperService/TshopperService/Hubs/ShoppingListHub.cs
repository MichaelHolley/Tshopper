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

    public async Task<List<ShoppingItem>> GetAllItems()
    {
        return await _shoppingListService.GetAllItemsAsync();
    }

    public async Task AddItem(string item, string quantity)
    {
        try
        {
            await _shoppingListService.AddItemAsync(item, quantity);
            await ReceiveUpdate();
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
            await _shoppingListService.CheckItemAsync(id);
            await ReceiveUpdate();
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
            await _shoppingListService.UncheckItemAsync(id);
            await ReceiveUpdate();
        }
        catch (BusinessException ex)
        {
            throw new HubException($"{ex.Code}: {ex.Message}");
        }
    }

    private async Task ReceiveUpdate()
    {
        await Clients.All.SendAsync("ReceiveUpdate", await GetAllItems());
    }

    public async Task DeleteAllCheckedItems()
    {
        try
        {
            await _shoppingListService.DeleteAllCheckedItemsAsync();
            await ReceiveUpdate();
        }
        catch (BusinessException ex)
        {
            throw new HubException($"{ex.Code}: {ex.Message}");
        }
    }

    public async Task UpdateItem(int id, string item, string quantity)
    {
        await _shoppingListService.UpdateItemAsync(id, item, quantity);
        await ReceiveUpdate();
    }

    public async Task DeleteItem(int id)
    {
        try
        {
            await _shoppingListService.DeleteItemAsync(id);
            await ReceiveUpdate();
        }
        catch (BusinessException ex)
        {
            throw new HubException($"{ex.Code}: {ex.Message}");
        }
    }

    public async Task ReorderItems(List<int> itemIds)
    {
        try
        {
            await _shoppingListService.ReorderItemsAsync(itemIds);
            await ReceiveUpdate();
        }
        catch (BusinessException ex)
        {
            throw new HubException($"{ex.Code}: {ex.Message}");
        }
    }
}