namespace TshopperService.Data;

public class UserPreference
{
    public int Id { get; set; }
    public int? DefaultStoreId { get; set; }
    public Store? DefaultStore { get; set; }
}
