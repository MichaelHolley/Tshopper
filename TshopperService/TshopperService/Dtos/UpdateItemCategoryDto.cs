namespace TshopperService.Dtos;

public class UpdateItemCategoryDto
{
    public required string ItemName { get; set; }
    public int CategoryId { get; set; }
    public bool IncludeItemName { get; set; }
}