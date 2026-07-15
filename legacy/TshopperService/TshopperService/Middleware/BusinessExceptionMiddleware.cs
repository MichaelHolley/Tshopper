using System.Net;
using System.Text.Json;
using TshopperService.Exceptions;

namespace TshopperService.Middleware;

public class BusinessExceptionMiddleware
{
    private readonly RequestDelegate _next;

    public BusinessExceptionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    private static HttpStatusCode GetStatusCode(string errorCode)
    {
        return errorCode switch
        {
            BusinessErrorCodes.NOT_FOUND => HttpStatusCode.NotFound,
            BusinessErrorCodes.INVALID_INPUT => HttpStatusCode.BadRequest,
            BusinessErrorCodes.VALIDATION_ERROR => HttpStatusCode.UnprocessableEntity,
            BusinessErrorCodes.DUPLICATE_ENTRY => HttpStatusCode.Conflict,
            BusinessErrorCodes.UNAUTHORIZED_ACCESS => HttpStatusCode.Forbidden,
            BusinessErrorCodes.DEPENDENCY_ERROR => HttpStatusCode.FailedDependency,
            BusinessErrorCodes.OPERATION_FAILED => HttpStatusCode.BadRequest,
            _ => HttpStatusCode.BadRequest
        };
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (BusinessException ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)GetStatusCode(ex.Code);

            var response = new
            {
                code = ex.Code,
                message = ex.Message,
                status = (int)GetStatusCode(ex.Code)
            };

            var json = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(json);
        }
    }
}

public static class BusinessExceptionMiddlewareExtensions
{
    public static IApplicationBuilder UseBusinessExceptionHandler(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<BusinessExceptionMiddleware>();
    }
} 