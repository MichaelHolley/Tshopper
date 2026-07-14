namespace TshopperService.Services;

public record ChatMessageRecord(string Role, string Content);
public record ChatResult(string Reply, List<ChatMessageRecord> UpdatedHistory);

/// <summary>An image attached to the current chat turn, already decoded from base64.</summary>
public record ChatImageContent(string MediaType, BinaryData Bytes);

public interface IChatService
{
    Task<ChatResult> ProcessAsync(string message, List<ChatMessageRecord> history, int? storeId, List<ChatImageContent>? images, CancellationToken cancellationToken = default);
}
