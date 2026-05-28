using System.ClientModel;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using OpenAI;
using OpenAI.Chat;
using TshopperService.Hubs;

namespace TshopperService.Services;

public class ChatService : IChatService
{
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

    public ChatService(
        IShoppingListService shoppingListService,
        IHubContext<ShoppingListHub> hubContext,
        IConfiguration configuration)
    {
        _shoppingListService = shoppingListService;
        _hubContext = hubContext;

        var apiKey = configuration["OpenRouter:ApiKey"]
            ?? throw new InvalidOperationException("OpenRouter:ApiKey not configured");
        var model = configuration["OpenRouter:Model"] ?? "anthropic/claude-haiku-4-5-20251001";
        var baseUrl = configuration["OpenRouter:BaseUrl"] ?? "https://openrouter.ai/api/v1";

        var clientOptions = new OpenAIClientOptions
        {
            Endpoint = new Uri(baseUrl)
        };

        var openAiClient = new OpenAIClient(new ApiKeyCredential(apiKey), clientOptions);
        _chatClient = openAiClient.GetChatClient(model);
    }

    public async Task<ChatResult> ProcessAsync(string message, List<ChatMessageRecord> history, int? storeId)
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
                - Keep responses brief — just confirm what you did or ask what you need.
                """)
        };

        foreach (var msg in history)
        {
            messages.Add(msg.Role == "user"
                ? ChatMessage.CreateUserMessage(msg.Content)
                : ChatMessage.CreateAssistantMessage(msg.Content));
        }

        messages.Add(ChatMessage.CreateUserMessage(message));

        var options = new ChatCompletionOptions();
        options.Tools.Add(ListItemsTool);
        options.Tools.Add(AddItemTool);
        options.Tools.Add(UpdateItemTool);
        options.Tools.Add(RemoveItemTool);

        var mutated = false;

        while (true)
        {
            var completion = await _chatClient.CompleteChatAsync(messages, options);
            var value = completion.Value;

            if (value.FinishReason == ChatFinishReason.ToolCalls)
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

            var reply = value.Content.Count > 0 ? value.Content[0].Text : string.Empty;

            if (mutated)
            {
                var items = await _shoppingListService.GetAllItemsAsync(storeId);
                await _hubContext.Clients.All.SendAsync("ReceiveUpdate", storeId, items);
            }

            var updatedHistory = new List<ChatMessageRecord>(history)
            {
                new("user", message),
                new("assistant", reply)
            };

            return new ChatResult(reply, updatedHistory);
        }
    }

    private async Task<(string Json, bool Mutated)> ExecuteToolAsync(ChatToolCall toolCall, int? storeId)
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

        return (Serialize(new { error = $"Unknown tool '{toolCall.FunctionName}'" }), false);
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
}
