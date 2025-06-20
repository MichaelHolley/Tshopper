namespace TshopperService.Data;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; }
    public List<ItemCategory> ItemCategories { get; set; } = new List<ItemCategory>();
}