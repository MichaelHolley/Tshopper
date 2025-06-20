using Microsoft.EntityFrameworkCore;
using TshopperService.Data;
using TshopperService.Exceptions;

namespace TshopperService.Services;

public class CategoryService : ICategoryService
{
    private readonly ShoppingListDbContext _dbContext;

    public CategoryService(ShoppingListDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<Category>> GetAllCategoriesAsync()
    {
        return await _dbContext.Categories.ToListAsync();
    }

    public async Task<Category> GetCategoryByIdAsync(int id)
    {
        var category = await _dbContext.Categories.FindAsync(id);
        if (category == null)
        {
            throw new BusinessException($"Category with ID {id} not found", BusinessErrorCodes.NOT_FOUND);
        }
        return category;
    }

    public async Task<Category> AddCategoryAsync(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new BusinessException("Category name cannot be empty", BusinessErrorCodes.INVALID_INPUT);
        }

        var category = new Category { Name = name };
        await _dbContext.Categories.AddAsync(category);
        await _dbContext.SaveChangesAsync();
        return category;
    }

    public async Task<Category> UpdateCategoryAsync(int id, string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new BusinessException("Category name cannot be empty", BusinessErrorCodes.INVALID_INPUT);
        }

        var category = await _dbContext.Categories.FindAsync(id);
        if (category == null)
        {
            throw new BusinessException($"Category with ID {id} not found", BusinessErrorCodes.NOT_FOUND);
        }

        category.Name = name;
        await _dbContext.SaveChangesAsync();
        return category;
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _dbContext.Categories.FindAsync(id);
        if (category == null)
        {
            throw new BusinessException($"Category with ID {id} not found", BusinessErrorCodes.NOT_FOUND);
        }

        _dbContext.Categories.Remove(category);
        await _dbContext.SaveChangesAsync();
        return true;
    }
} 