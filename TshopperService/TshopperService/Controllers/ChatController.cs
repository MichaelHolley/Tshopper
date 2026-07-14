using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TshopperService.Services;

namespace TshopperService.Controllers;

/// <summary>An image attached to the current chat turn. <see cref="Data"/> is raw base64 (no data-URI prefix).</summary>
public record ChatImage(string MediaType, string Data);
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

    // 4 images x 5 MB decoded is ~26.7 MB as base64; set an explicit ceiling above that
    // (plus history/overhead) so an oversized body yields our BadRequest, not an opaque 413.
    [HttpPost]
    [RequestSizeLimit(40 * 1024 * 1024)]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        var images = request.Images ?? [];

        if (string.IsNullOrWhiteSpace(request.Message) && images.Count == 0)
            return BadRequest(new { error = "Message or an image is required" });

        if (images.Count > MaxImages)
            return BadRequest(new { error = $"At most {MaxImages} images can be attached" });

        var decoded = new List<ChatImageContent>(images.Count);
        foreach (var image in images)
        {
            if (string.IsNullOrEmpty(image.MediaType) || !AllowedImageTypes.Contains(image.MediaType))
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

            decoded.Add(new ChatImageContent(image.MediaType, BinaryData.FromBytes(bytes)));
        }

        var result = await _chatService.ProcessAsync(
            request.Message ?? string.Empty,
            request.History ?? [],
            request.StoreId,
            decoded,
            HttpContext.RequestAborted);

        return Ok(new ChatResponse(result.Reply, result.UpdatedHistory));
    }
}
