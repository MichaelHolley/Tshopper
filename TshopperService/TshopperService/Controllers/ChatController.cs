using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TshopperService.Services;

namespace TshopperService.Controllers;

public record ChatRequest(string Message, List<ChatMessageRecord> History, int? StoreId);
public record ChatResponse(string Reply, List<ChatMessageRecord> UpdatedHistory);

[ApiController]
[Route("/api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;

    public ChatController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpPost]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { error = "Message cannot be empty" });

        var result = await _chatService.ProcessAsync(
            request.Message,
            request.History ?? [],
            request.StoreId,
            HttpContext.RequestAborted);

        return Ok(new ChatResponse(result.Reply, result.UpdatedHistory));
    }
}
