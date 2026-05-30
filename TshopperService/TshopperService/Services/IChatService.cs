namespace TshopperService.Services;

public record ChatMessageRecord(string Role, string Content);
public record ChatResult(string Reply, List<ChatMessageRecord> UpdatedHistory);

public interface IChatService
{
    Task<ChatResult> ProcessAsync(string message, List<ChatMessageRecord> history, int? storeId);
}
