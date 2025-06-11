namespace TshopperService.Exceptions;

public class BusinessException : Exception
{
    public string Code { get; }

    public BusinessException(string message, string code = "BUSINESS_ERROR") : base(message)
    {
        Code = code;
    }

    public BusinessException(string message, Exception innerException, string code = "BUSINESS_ERROR") 
        : base(message, innerException)
    {
        Code = code;
    }
}

public static class BusinessErrorCodes
{
    public const string NOT_FOUND = "NOT_FOUND";
    public const string INVALID_INPUT = "INVALID_INPUT";
    public const string DUPLICATE_ENTRY = "DUPLICATE_ENTRY";
    public const string VALIDATION_ERROR = "VALIDATION_ERROR";
    public const string OPERATION_FAILED = "OPERATION_FAILED";
    public const string UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS";
    public const string DEPENDENCY_ERROR = "DEPENDENCY_ERROR";
} 