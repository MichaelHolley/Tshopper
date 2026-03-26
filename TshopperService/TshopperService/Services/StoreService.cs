using Microsoft.EntityFrameworkCore;
using TshopperService.Data;
using TshopperService.Exceptions;

namespace TshopperService.Services;

public class StoreService : IStoreService
{
    private readonly ShoppingListDbContext _dbContext;

    public StoreService(ShoppingListDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<Store>> GetAllStoresAsync()
    {
        return await _dbContext.Stores
            .OrderBy(s => s.Name)
            .ToListAsync();
    }

    public async Task<Store> GetStoreByIdAsync(int id)
    {
        var store = await _dbContext.Stores.FindAsync(id);
        if (store == null)
            throw new BusinessException($"Store with ID {id} not found", BusinessErrorCodes.NOT_FOUND);

        return store;
    }

    public async Task<Store> AddStoreAsync(string name, string color)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new BusinessException("Store name cannot be empty", BusinessErrorCodes.INVALID_INPUT);

        if (string.IsNullOrWhiteSpace(color))
            throw new BusinessException("Store color cannot be empty", BusinessErrorCodes.INVALID_INPUT);

        var store = new Store { Name = name, Color = color };
        await _dbContext.Stores.AddAsync(store);
        await _dbContext.SaveChangesAsync();
        return store;
    }

    public async Task<Store> UpdateStoreAsync(int id, string name, string color)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new BusinessException("Store name cannot be empty", BusinessErrorCodes.INVALID_INPUT);

        if (string.IsNullOrWhiteSpace(color))
            throw new BusinessException("Store color cannot be empty", BusinessErrorCodes.INVALID_INPUT);

        var store = await _dbContext.Stores.FindAsync(id);
        if (store == null)
            throw new BusinessException($"Store with ID {id} not found", BusinessErrorCodes.NOT_FOUND);

        store.Name = name;
        store.Color = color;
        await _dbContext.SaveChangesAsync();
        return store;
    }

    public async Task<bool> DeleteStoreAsync(int id)
    {
        var store = await _dbContext.Stores.FindAsync(id);
        if (store == null)
            throw new BusinessException($"Store with ID {id} not found", BusinessErrorCodes.NOT_FOUND);

        _dbContext.Stores.Remove(store);
        await _dbContext.SaveChangesAsync();
        return true;
    }
}
