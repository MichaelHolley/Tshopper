using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TshopperService.Services;

namespace TshopperService.Controllers;

public record ChatRequest(string Message, List<ChatMessageRecord> History, int? StoreId, List<ChatImage>? Images);
public record ChatResponse(string Reply, List<ChatMessageRecord> UpdatedHistory);

[ApiController]
[Route("/api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private const int MaxImages = 4;
    private const int MaxImageBytes = 5 * 1024 * 1024; // 5 MB decoded, per image

    private static readonly HashSet<string> AllowedImageTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/png", "image/jpeg", "image/webp"
    };

    private readonly IChatService _chatService;

    public ChatController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpPost]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        var images = request.Images ?? [];

        if (string.IsNullOrWhiteSpace(request.Message) && images.Count == 0)
            return BadRequest(new { error = "Message or an image is required" });

        if (images.Count > MaxImages)
            return BadRequest(new { error = $"At most {MaxImages} images can be attached" });

        foreach (var image in images)
        {
            if (!AllowedImageTypes.Contains(image.MediaType))
                return BadRequest(new { error = $"Unsupported image type '{image.MediaType}'. Allowed: PNG, JPEG, WebP." });

            byte[] bytes;
            try
            {
                bytes = Convert.FromBase64String(image.Data ?? string.Empty);
            }
            catch (FormatException)
            {
                return BadRequest(new { error = "Image data is not valid base64" });
            }

            if (bytes.Length == 0)
                return BadRequest(new { error = "Image data cannot be empty" });

            if (bytes.Length > MaxImageBytes)
                return BadRequest(new { error = "Each image must be 5 MB or smaller" });
        }

        var result = await _chatService.ProcessAsync(
            request.Message ?? string.Empty,
            request.History ?? [],
            request.StoreId,
            images,
            HttpContext.RequestAborted);

        return Ok(new ChatResponse(result.Reply, result.UpdatedHistory));
    }
}
