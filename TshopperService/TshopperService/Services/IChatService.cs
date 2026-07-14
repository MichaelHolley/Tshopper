namespace TshopperService.Services;

public record ChatMessageRecord(string Role, string Content);
public record ChatResult(string Reply, List<ChatMessageRecord> UpdatedHistory);

/// <summary>An image attached to the current chat turn. <see cref="Data"/> is raw base64 (no data-URI prefix).</summary>
public record ChatImage(string MediaType, string Data);

public interface IChatService
{
    Task<ChatResult> ProcessAsync(string message, List<ChatMessageRecord> history, int? storeId, List<ChatImage>? images, CancellationToken cancellationToken = default);
}
