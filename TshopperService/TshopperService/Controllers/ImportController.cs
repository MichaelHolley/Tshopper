using System.Globalization;
using System.Text;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TshopperService.Data;
using TshopperService.Services;

namespace TshopperService.Controllers;

[ApiController]
[Authorize]
[Route("/api/[controller]")]
public class ImportController : ControllerBase
{
    private readonly IShoppingListService _shoppingListService;

    public ImportController(IShoppingListService shoppingListService)
    {
        _shoppingListService = shoppingListService;
    }
    
    [HttpPost]
    public async Task<IActionResult> ImportCSV()
    {
        if (!Request.HasFormContentType)
        {
            return BadRequest("Request must be multipart/form-data.");
        }

        var form = await Request.ReadFormAsync();
        var file = form.Files.GetFile("file");
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded or file is empty.");
        }

        List<ShoppingItem> parsedItems;

        using (var reader = new StreamReader(file.OpenReadStream(), Encoding.UTF8))
        {
            // Create a CsvConfiguration object
            var csvConfig = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                Delimiter = ";",
                PrepareHeaderForMatch = args => args.Header.ToLowerInvariant(),
            };

            using (var csv = new CsvReader(reader, csvConfig))
            {
                parsedItems = csv.GetRecords<ShoppingItem>().ToList();
                parsedItems.ForEach(i => i.Id = 0);
            }
        }

        Console.WriteLine("--- Parsed CSV Data ---");
        await _shoppingListService.AddItems(parsedItems);
        Console.WriteLine("--- End Parsed CSV Data ---");

        return Ok();
    }
}