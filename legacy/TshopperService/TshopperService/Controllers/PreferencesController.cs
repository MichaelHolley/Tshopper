using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TshopperService.Data;
using TshopperService.Services;

namespace TshopperService.Controllers;

[ApiController]
[Authorize]
[Route("/api/[controller]")]
public class PreferencesController : ControllerBase
{
    private readonly IPreferencesService _preferencesService;

    public PreferencesController(IPreferencesService preferencesService)
    {
        _preferencesService = preferencesService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPreferences()
    {
        var preferences = await _preferencesService.GetPreferencesAsync();
        return Ok(preferences);
    }

    [HttpPut]
    public async Task<IActionResult> UpdatePreferences([FromBody] UserPreference preferences)
    {
        var updated = await _preferencesService.UpdatePreferencesAsync(preferences);
        return Ok(updated);
    }
}
