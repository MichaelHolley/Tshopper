using TshopperService.Data;

namespace TshopperService.Services;

public interface IPreferencesService
{
    Task<UserPreference> GetPreferencesAsync();
    Task<UserPreference> UpdatePreferencesAsync(UserPreference preferences);
}
