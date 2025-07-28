// ============================================================================
// ERROR RESPONSE TYPES
// ============================================================================

interface DjangoValidationErrorDetail {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
  ctx?: {
    error?: string;
    [key: string]: unknown;
  };
}

interface DjangoErrorResponse {
  message?: string;
  detail?: string | DjangoValidationErrorDetail[];
  [key: string]: unknown;
}

/**
 * Base API Error Class - Foundation for all API errors
 */
export class BaseApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: unknown;
  public readonly timestamp: Date;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

/**
 * Specific Error Types
 */
export class ValidationError extends BaseApiError {
  public readonly fieldErrors: Record<string, string[]>;

  constructor(
    message: string,
    fieldErrors: Record<string, string[]> = {},
    details?: unknown
  ) {
    super(message, 422, "VALIDATION_ERROR", details);
    this.fieldErrors = fieldErrors;
  }
}

export class NotFoundError extends BaseApiError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends BaseApiError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends BaseApiError {
  constructor(message = "Access forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictError extends BaseApiError {
  constructor(message: string, details?: unknown) {
    super(message, 409, "CONFLICT", details);
  }
}

export class ServerError extends BaseApiError {
  constructor(message = "Internal server error", details?: unknown) {
    super(message, 500, "SERVER_ERROR", details);
  }
}

export class NetworkError extends BaseApiError {
  constructor(message = "Network connection failed") {
    super(message, 0, "NETWORK_ERROR");
  }
}

// ============================================================================
// ERROR FACTORY
// ============================================================================

export class ApiErrorFactory {
  static createFromResponse(errorData: unknown, status: number): BaseApiError {
    // Try to determine error type from response structure
    const djangoError = this.normalizeDjangoError(errorData);

    switch (status) {
      case 400:
        return new ValidationError(
          djangoError?.message || "Bad request",
          djangoError?.fieldErrors || {}
        );
      case 401:
        return new UnauthorizedError(djangoError?.message);
      case 403:
        return new ForbiddenError(djangoError?.message);
      case 404:
        return new NotFoundError("Resource", djangoError?.message);
      case 409:
        return new ConflictError(djangoError?.message || "Conflict occurred");
      case 422:
        return new ValidationError(
          djangoError?.message || "Validation failed",
          djangoError?.fieldErrors || {}
        );
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(djangoError?.message);
      default:
        return new BaseApiError(
          djangoError?.message || "Unknown error occurred",
          status,
          "UNKNOWN_ERROR"
        );
    }
  }

  private static normalizeDjangoError(errorData: unknown): {
    message: string;
    fieldErrors?: Record<string, string[]>;
  } | null {
    if (!errorData || typeof errorData !== "object") {
      return null;
    }

    const data = errorData as DjangoErrorResponse;

    // Django Ninja Error
    if ("message" in data && typeof data.message === "string") {
      return { message: data.message };
    }

    // Django 422 Validation Error
    if ("detail" in data && Array.isArray(data.detail)) {
      const fieldErrors: Record<string, string[]> = {};
      const messages: string[] = [];

      data.detail.forEach((error: DjangoValidationErrorDetail) => {
        if (error.loc && error.msg) {
          const field = error.loc[error.loc.length - 1];
          const fieldName = String(field);
          if (!fieldErrors[fieldName]) fieldErrors[fieldName] = [];
          fieldErrors[fieldName].push(error.msg);
        } else if (error.ctx?.error) {
          messages.push(error.ctx.error);
        }
      });

      return {
        message:
          messages.length > 0 ? messages.join(", ") : "Validation failed",
        fieldErrors:
          Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      };
    }

    // Django Not Found Error
    if ("detail" in data && typeof data.detail === "string") {
      return { message: data.detail };
    }

    // Array of errors
    if (Array.isArray(data)) {
      const messages = data
        .map((error: unknown) => {
          if (
            error &&
            typeof error === "object" &&
            "ctx" in error &&
            error.ctx &&
            typeof error.ctx === "object" &&
            "error" in error.ctx &&
            typeof error.ctx.error === "string"
          ) {
            return error.ctx.error;
          }
          return null;
        })
        .filter(Boolean) as string[];
      return { message: messages.join(", ") || "Multiple errors occurred" };
    }

    return null;
  }
}
