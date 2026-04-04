using Microsoft.EntityFrameworkCore;
using TshopperService.Data;

namespace TshopperService.Services;

public class PreferencesService : IPreferencesService
{
    private readonly ShoppingListDbContext _dbContext;

    public PreferencesService(ShoppingListDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UserPreference> GetPreferencesAsync()
    {
        return await _dbContext.UserPreferences.FirstOrDefaultAsync() ?? new UserPreference();
    }

    public async Task<UserPreference> UpdatePreferencesAsync(UserPreference preferences)
    {
        var existing = await _dbContext.UserPreferences.FirstOrDefaultAsync();
        if (existing == null)
        {
            existing = new UserPreference();
            await _dbContext.UserPreferences.AddAsync(existing);
        }

        existing.DefaultStoreId = preferences.DefaultStoreId;

        await _dbContext.SaveChangesAsync();
        return existing;
    }
}
