using Microsoft.AspNetCore.SignalR;

namespace TshopperService;

public sealed class ShoppingListHub : Hub
{
    public async Task SendUpdate(ShoppingItem item)
    {
            await Clients.All.SendAsync("ReceiveUpdate", item);
    }
}