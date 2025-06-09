namespace TshopperService.Data;

public class ItemCategory
{
    public int Id { get; set; }
    public string ItemName { get; set; }
    public bool IncludeItemName { get; set; } = false;
    
    public int CategoryId { get; set; }
    public Category Category { get; set; }
}