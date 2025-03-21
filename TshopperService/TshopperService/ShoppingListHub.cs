using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace TshopperService;

public sealed class ShoppingListHub : Hub
{
    private readonly ShoppingListDbContext _dbContext;

    public ShoppingListHub(ShoppingListDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ShoppingItem>> GetAllItems()
    {
        return await _dbContext.ShoppingList
            .Where(i => i.Checked == null || i.Checked > DateTime.Now.AddDays(-7))
            .OrderBy(i => i.Checked != null)
            .ThenByDescending(i => i.Checked)
            .ThenBy(i => i.Item)
            .ToListAsync();
    }

    public async Task AddItem(string item, string quantity)
    {
        var newItem = new ShoppingItem
        {
            Item = item,
            Quantity = quantity
        };

        await _dbContext.ShoppingList.AddAsync(newItem);
        await _dbContext.SaveChangesAsync();

        await ReceiveUpdate();
    }

    public async Task CheckItem(int id)
    {
        var item = await _dbContext.ShoppingList.FindAsync(id);

        if (item == null)
        {
            return;
        }

        item.Checked = DateTime.Now;
        await _dbContext.SaveChangesAsync();

        await ReceiveUpdate();
    }

    public async Task UncheckItem(int id)
    {
        var item = await _dbContext.ShoppingList.FindAsync(id);

        if (item == null)
        {
            return;
        }

        item.Checked = null;
        await _dbContext.SaveChangesAsync();

        await ReceiveUpdate();
    }

    private async Task ReceiveUpdate()
    {
        await Clients.All.SendAsync("ReceiveUpdate", await GetAllItems());
    }
}