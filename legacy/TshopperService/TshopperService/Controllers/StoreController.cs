using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TshopperService.Data;
using TshopperService.Services;

namespace TshopperService.Controllers;

[ApiController]
[Authorize]
[Route("/api/[controller]")]
public class StoreController : ControllerBase
{
    private readonly IStoreService _storeService;

    public StoreController(IStoreService storeService)
    {
        _storeService = storeService;
    }

    [HttpGet]
    public async Task<IActionResult> GetStores()
    {
        var stores = await _storeService.GetAllStoresAsync();
        return Ok(stores);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetStore(int id)
    {
        var store = await _storeService.GetStoreByIdAsync(id);
        return Ok(store);
    }

    [HttpPost]
    public async Task<IActionResult> AddStore([FromBody] Store store)
    {
        if (store == null)
            return BadRequest("Store cannot be null");

        var newStore = await _storeService.AddStoreAsync(store.Name, store.Color);
        return Ok(newStore);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStore(int id, [FromBody] Store store)
    {
        if (store == null)
            return BadRequest("Store cannot be null");

        if (id != store.Id)
            return BadRequest("Store IDs must match");

        var updatedStore = await _storeService.UpdateStoreAsync(id, store.Name, store.Color);
        return Ok(updatedStore);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStore(int id)
    {
        await _storeService.DeleteStoreAsync(id);
        return Ok();
    }
}
