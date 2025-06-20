using TshopperService.Data;

namespace TshopperService.Services;

public interface ICategoryService
{
    Task<List<Category>> GetAllCategoriesAsync();
    Task<Category> GetCategoryByIdAsync(int id);
    Task<Category> AddCategoryAsync(string name);
    Task<Category> UpdateCategoryAsync(int id, string name);
    Task<bool> DeleteCategoryAsync(int id);
} 