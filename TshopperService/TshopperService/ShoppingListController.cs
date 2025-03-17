using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using TshopperService;

[Route("api/[controller]")]
[ApiController]
public class ShoppingListController : ControllerBase
{
    private readonly ShoppingListDbContext _dbContext;
    private readonly IHubContext<ShoppingListHub> _hubContext;

    public ShoppingListController(ShoppingListDbContext dbContext, IHubContext<ShoppingListHub> hubContext)
    {
        _dbContext = dbContext;
        _hubContext = hubContext;
    }

    [HttpGet]
    public ActionResult<IEnumerable<ShoppingItem>> GetItems()
    {
        return Ok(_dbContext.ShoppingList.ToList());
    }

    [HttpPost]
    public async Task<ActionResult<ShoppingItem>> AddItem(ShoppingItem item)
    {
        _dbContext.ShoppingList.Add(item);
        await _dbContext.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync("ReceiveUpdate", item);
        return CreatedAtAction(nameof(GetItems), new { id = item.Id }, item);
    }
}