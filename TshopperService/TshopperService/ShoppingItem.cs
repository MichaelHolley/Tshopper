namespace TshopperService;

public class ShoppingItem
{
    public int Id { get; set; }
    public string Item { get; set; } = string.Empty;
    public string Quantity { get; set; } = string.Empty;
    public DateTime? Checked { get; set; }
}