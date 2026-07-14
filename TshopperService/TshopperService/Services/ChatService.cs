using System.ClientModel;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using OpenAI;
using OpenAI.Chat;
using TshopperService.Exceptions;
using TshopperService.Hubs;

namespace TshopperService.Services;

public class ChatService : IChatService
{
    private const int MaxIterations = 25; // generous: bounds round-trips, not operations

    private readonly IShoppingListService _shoppingListService;
    private readonly IHubContext<ShoppingListHub> _hubContext;
    private readonly ChatClient _chatClient;

    private static readonly ChatTool ListItemsTool = ChatTool.CreateFunctionTool(
        "list_items",
        "List all current shopping items for the active store. Call this before update_item or remove_item.",
        Schema(new { type = "object", properties = new { }, required = Array.Empty<string>() })
    );

    private static readonly ChatTool AddItemTool = ChatTool.CreateFunctionTool(
        "add_item",
        "Add a new item to the shopping list.",
        Schema(new
        {
            type = "object",
            properties = new
            {
                name = new { type = "string", description = "Item name" },
                quantity = new { type = "string", description = "Quantity or amount, e.g. '2', '1 kg', '500 ml'. Use empty string if not specified." }
            },
            required = new[] { "name", "quantity" }
        })
    );

    private static readonly ChatTool UpdateItemTool = ChatTool.CreateFunctionTool(
        "update_item",
        "Update an existing item's name or quantity. Call list_items first to get the correct item ID.",
        Schema(new
        {
            type = "object",
            properties = new
            {
                id = new { type = "integer", description = "Item ID from list_items" },
                name = new { type = "string", description = "New item name" },
                quantity = new { type = "string", description = "New quantity" }
            },
            required = new[] { "id", "name", "quantity" }
        })
    );

    private static readonly ChatTool RemoveItemTool = ChatTool.CreateFunctionTool(
        "remove_item",
        "Remove an item from the shopping list. Call list_items first to get the correct item ID.",
        Schema(new
        {
            type = "object",
            properties = new
            {
                id = new { type = "integer", description = "Item ID from list_items" }
            },
            required = new[] { "id" }
        })
    );

    private static readonly ChatTool RemoveItemsTool = ChatTool.CreateFunctionTool(
        "remove_items",
        "Remove multiple items at once. Prefer this over repeated remove_item calls when removing more than one item.",
        Schema(new
        {
            type = "object",
            properties = new
            {
                ids = new
                {
                    type = "array",
                    items = new { type = "integer" },
                    description = "Item IDs to remove (from list_items)"
                }
            },
            required = new[] { "ids" }
        })
    );

    private static readonly ChatTool ClearCheckedTool = ChatTool.CreateFunctionTool(
        "clear_checked",
        "Remove all checked items from the shopping list in a single operation. Prefer this over removing checked items one by one.",
        Schema(new { type = "object", properties = new { }, required = Array.Empty<string>() })
    );

    public ChatService(
        IShoppingListService shoppingListService,
        IHubContext<ShoppingListHub> hubContext,
        IConfiguration configuration)
    {
        _shoppingListService = shoppingListService;
        _hubContext = hubContext;

        var apiKey = configuration["OpenRouter:ApiKey"]
            ?? throw new InvalidOperationException("OpenRouter:ApiKey not configured");
        var model = configuration["OpenRouter:Model"] ?? "openai/gpt-5.4-mini";
        var baseUrl = configuration["OpenRouter:BaseUrl"] ?? "https://openrouter.ai/api/v1";

        var clientOptions = new OpenAIClientOptions
        {
            Endpoint = new Uri(baseUrl)
        };

        var openAiClient = new OpenAIClient(new ApiKeyCredential(apiKey), clientOptions);
        _chatClient = openAiClient.GetChatClient(model);
    }

    public async Task<ChatResult> ProcessAsync(string message, List<ChatMessageRecord> history, int? storeId, List<ChatImage>? images, CancellationToken cancellationToken = default)
    {
        var messages = new List<ChatMessage>
        {
            ChatMessage.CreateSystemMessage(
                $"""
                You are a helpful shopping list assistant for Tshopper.
                The user's active store context ID is: {storeId?.ToString() ?? "null (unassigned)"}.
                Help users manage their shopping list using natural language.
                Rules:
                - Always call list_items before update_item or remove_item to get accurate IDs.
                - For ambiguous requests, ask one concise clarifying question.
                - For remove actions, confirm with the user before executing unless they have already confirmed.
                - You can execute multiple operations in a single user message.
                - When operating on many items, use remove_items or clear_checked and batch tool calls in a single turn rather than removing items one at a time.
                - Keep responses brief — just confirm what you did or ask what you need.
                """)
        };

        foreach (var msg in history)
        {
            messages.Add(msg.Role == "user"
                ? ChatMessage.CreateUserMessage(msg.Content)
                : ChatMessage.CreateAssistantMessage(msg.Content));
        }

        messages.Add(BuildUserMessage(message, images));

        var options = new ChatCompletionOptions();
        options.Tools.Add(ListItemsTool);
        options.Tools.Add(AddItemTool);
        options.Tools.Add(UpdateItemTool);
        options.Tools.Add(RemoveItemTool);
        options.Tools.Add(RemoveItemsTool);
        options.Tools.Add(ClearCheckedTool);

        var mutated = false;

        for (var iteration = 0; ; iteration++)
        {
            ChatCompletionOptions callOptions = options;

            if (iteration >= MaxIterations)
            {
                // Force a text reply instead of another tool call so the user gets a
                // coherent answer instead of an infinite loop or a hard error.
                callOptions = new ChatCompletionOptions();
            }

            var completion = await _chatClient.CompleteChatAsync(messages, callOptions, cancellationToken);
            var value = completion.Value;

            if (iteration < MaxIterations && value.FinishReason == ChatFinishReason.ToolCalls)
            {
                messages.Add(new AssistantChatMessage(value));

                foreach (var toolCall in value.ToolCalls)
                {
                    var (json, didMutate) = await ExecuteToolAsync(toolCall, storeId);
                    if (didMutate) mutated = true;
                    messages.Add(new ToolChatMessage(toolCall.Id, json));
                }

                continue;
            }

            var reply = value.FinishReason switch
            {
                ChatFinishReason.Length =>
                    "My response was cut off before I could finish. Could you ask again, maybe more specifically?",
                ChatFinishReason.ContentFilter =>
                    "I can't help with that request.",
                _ when value.Content.Count > 0 => value.Content[0].Text,
                _ => "Sorry, I couldn't complete that request. Please try rephrasing."
            };

            if (mutated)
            {
                var items = await _shoppingListService.GetAllItemsAsync(storeId);
                await _hubContext.Clients.All.SendAsync("ReceiveUpdate", storeId, items, cancellationToken);
            }

            // Images live only on the current turn and are never persisted into history
            // (keeps token cost bounded). For an image-only turn, store a placeholder so the
            // stored user message is never empty.
            var storedUserContent = string.IsNullOrWhiteSpace(message)
                ? "[image]"
                : message;

            var updatedHistory = new List<ChatMessageRecord>(history)
            {
                new("user", storedUserContent),
                new("assistant", reply)
            };

            return new ChatResult(reply, updatedHistory);
        }
    }

    private async Task<(string Json, bool Mutated)> ExecuteToolAsync(ChatToolCall toolCall, int? storeId)
    {
        try
        {
            var args = toolCall.FunctionArguments;

            if (toolCall.FunctionName == ListItemsTool.FunctionName)
            {
                var items = await _shoppingListService.GetAllItemsAsync(storeId);
                return (Serialize(items), false);
            }
            if (toolCall.FunctionName == AddItemTool.FunctionName)
            {
                var p = Deserialize<AddItemArgs>(args);
                var item = await _shoppingListService.AddItemAsync(p.Name, p.Quantity, storeId);
                return (Serialize(item), true);
            }
            if (toolCall.FunctionName == UpdateItemTool.FunctionName)
            {
                var p = Deserialize<UpdateItemArgs>(args);
                var item = await _shoppingListService.UpdateItemAsync(p.Id, p.Name, p.Quantity);
                return (Serialize(item), true);
            }
            if (toolCall.FunctionName == RemoveItemTool.FunctionName)
            {
                var p = Deserialize<RemoveItemArgs>(args);
                await _shoppingListService.DeleteItemAsync(p.Id);
                return (Serialize(new { deleted = true, id = p.Id }), true);
            }
            if (toolCall.FunctionName == RemoveItemsTool.FunctionName)
            {
                var p = Deserialize<RemoveItemsArgs>(args);
                await _shoppingListService.DeleteItemsAsync(p.Ids);
                return (Serialize(new { deleted = true, ids = p.Ids }), true);
            }
            if (toolCall.FunctionName == ClearCheckedTool.FunctionName)
            {
                await _shoppingListService.DeleteAllCheckedItemsAsync(storeId);
                return (Serialize(new { cleared = true }), true);
            }

            return (Serialize(new { error = $"Unknown tool '{toolCall.FunctionName}'" }), false);
        }
        catch (BusinessException ex)
        {
            return (Serialize(new { error = ex.Message }), false);
        }
        catch (Exception ex)
        {
            return (Serialize(new { error = $"Failed to execute '{toolCall.FunctionName}': {ex.Message}" }), false);
        }
    }

    private static UserChatMessage BuildUserMessage(string message, List<ChatImage>? images)
    {
        if (images is null || images.Count == 0)
            return ChatMessage.CreateUserMessage(message);

        var parts = new List<ChatMessageContentPart>();

        // Only include a text part when there is actual text; an image-only turn
        // relies on the image plus the system prompt.
        if (!string.IsNullOrWhiteSpace(message))
            parts.Add(ChatMessageContentPart.CreateTextPart(message));

        foreach (var image in images)
        {
            var bytes = BinaryData.FromBytes(Convert.FromBase64String(image.Data));
            parts.Add(ChatMessageContentPart.CreateImagePart(bytes, image.MediaType));
        }

        return ChatMessage.CreateUserMessage(parts.ToArray());
    }

    private static BinaryData Schema(object schema) =>
        BinaryData.FromString(JsonSerializer.Serialize(schema, JsonSerializerOptions.Web));

    private static string Serialize<T>(T value) =>
        JsonSerializer.Serialize(value, JsonSerializerOptions.Web);

    private static T Deserialize<T>(BinaryData data) =>
        JsonSerializer.Deserialize<T>(data, JsonSerializerOptions.Web)
            ?? throw new InvalidOperationException($"Failed to deserialize {typeof(T).Name}");

    private record AddItemArgs(string Name, string Quantity);
    private record UpdateItemArgs(int Id, string Name, string Quantity);
    private record RemoveItemArgs(int Id);
    private record RemoveItemsArgs(List<int> Ids);
}
