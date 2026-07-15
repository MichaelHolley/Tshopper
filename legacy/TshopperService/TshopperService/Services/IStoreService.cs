using TshopperService.Data;

namespace TshopperService.Services;

public interface IStoreService
{
    Task<List<Store>> GetAllStoresAsync();
    Task<Store> GetStoreByIdAsync(int id);
    Task<Store> AddStoreAsync(string name, string color);
    Task<Store> UpdateStoreAsync(int id, string name, string color);
    Task<bool> DeleteStoreAsync(int id);
}
