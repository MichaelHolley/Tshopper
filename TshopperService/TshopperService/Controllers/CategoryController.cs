using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TshopperService.Data;
using TshopperService.Services;

namespace TshopperService.Controllers;

[ApiController]
[Authorize]
[Route("/api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoryController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _categoryService.GetAllCategoriesAsync();
        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategory(int id)
    {
        var category = await _categoryService.GetCategoryByIdAsync(id);
        return Ok(category);
    }

    [HttpPost]
    public async Task<IActionResult> AddCategory([FromBody] Category category)
    {
        if (category == null)
        {
            return BadRequest("Category cannot be null");
        }

        var newCategory = await _categoryService.AddCategoryAsync(category.Name);
        return Ok(newCategory);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category category)
    {
        if (category == null)
        {
            return BadRequest("Category cannot be null");
        }

        if (id != category.Id)
        {
            return BadRequest("Category IDs must match");
        }

        var updatedCategory = await _categoryService.UpdateCategoryAsync(id, category.Name);
        return Ok(updatedCategory);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        await _categoryService.DeleteCategoryAsync(id);
        return Ok();
    }
}