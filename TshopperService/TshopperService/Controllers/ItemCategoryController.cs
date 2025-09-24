using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TshopperService.Data;
using TshopperService.Services;
using TshopperService.Dtos;

namespace TshopperService.Controllers;

[ApiController]
[Authorize]
[Route("/api/[controller]")]
public class ItemCategoryController : ControllerBase
{
    private readonly IItemCategoryService _itemCategoryService;

    public ItemCategoryController(IItemCategoryService itemCategoryService)
    {
        _itemCategoryService = itemCategoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetItemCategories()
    {
        var itemCategories = await _itemCategoryService.GetAllItemCategoriesAsync();
        return Ok(itemCategories);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetItemCategory(int id)
    {
        var itemCategory = await _itemCategoryService.GetItemCategoryByIdAsync(id);
        return Ok(itemCategory);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateItemCategory([FromBody] UpdateItemCategoryDto itemCategoryDto)
    {
        if (itemCategoryDto == null)
        {
            return BadRequest("ItemCategory cannot be null");
        }

        var updatedItemCategory =
            await _itemCategoryService.ToggleItemCategoryAsync(itemCategoryDto.ItemName, itemCategoryDto.CategoryId);

        return Ok(updatedItemCategory);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItemCategory(int id)
    {
        await _itemCategoryService.DeleteItemCategoryAsync(id);
        return Ok();
    }
}