namespace TshopperService;

public class ShoppingItem
{
    public int Id { get; set; }
    public string Item { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public bool Checked { get; set; } = false;
}