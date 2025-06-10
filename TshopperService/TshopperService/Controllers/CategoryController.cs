using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TshopperService.Data;

namespace TshopperService.Controllers;

[ApiController]
[Authorize]
[Route("/api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly ShoppingListDbContext _dbContext;

    public CategoryController(ShoppingListDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var result = await _dbContext.ItemCategories.Select(i => i.Category).ToListAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategory(int id)
    {
        var category = await _dbContext.Categories.FindAsync(id);

        if (category == null) return NotFound();

        return Ok(category);
    }

    [HttpPost]
    public async Task<IActionResult> AddCategory([FromBody] Category category)
    {
        var newCategory = await _dbContext.Categories.AddAsync(new Category() { Name = category.Name });
        await _dbContext.SaveChangesAsync();

        return Ok(newCategory);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category category)
    {
        if (id != category.Id) return BadRequest("Category IDs must match");

        var existingCategory = await _dbContext.Categories.FindAsync(id);

        if (existingCategory == null) return NotFound();

        existingCategory.Name = category.Name;
        await _dbContext.SaveChangesAsync();

        return Ok(existingCategory);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _dbContext.Categories.FindAsync(id);
        if (category == null) return NotFound();

        _dbContext.Categories.Remove(category);
        await _dbContext.SaveChangesAsync();

        return Ok();
    }
}