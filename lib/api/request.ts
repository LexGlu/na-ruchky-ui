import Cookies from "js-cookie";

import { BASE_API_URL } from "@/lib/api/constants";
import { FetchError, BackendErrorResponse, ApiError } from "@/lib/types/errors";
import {
  isDjangoNinjaErrorResponse,
  isDjangoNotFoundError,
  isDjango422Response,
  isDjangoErrorResponseDetailArray,
  isValidationError,
  isApiError,
} from "@/lib/types/type-guards";

/**
 * Retrieves CSRF token from cookies or fetches it from the backend if not present.
 * @returns The CSRF token as a string.
 * @throws {FetchError} If fetching the CSRF token fails.
 */
async function getCSRFToken(): Promise<string> {
  let csrfToken = Cookies.get("csrftoken");

  if (!csrfToken) {
    const response = await fetch(`${BASE_API_URL}/api/v1/auth/csrf`, {
      method: "GET",
      credentials: "include", // Ensure cookies are included in the request
    });

    if (response.ok) {
      // The backend should set the 'csrftoken' cookie in the response
      csrfToken = Cookies.get("csrftoken");
      console.log("CSRF token fetched:", csrfToken);
      if (!csrfToken) {
        throw new FetchError("CSRF token not found in response");
      }
    } else {
      throw new FetchError("Failed to fetch CSRF token", response.status);
    }
  }

  return csrfToken;
}

/**
 * Normalizes backend error responses into ApiError.
 * @param errorResponse The raw error response from the backend.
 * @returns An ApiError object.
 */
function normalizeError(errorResponse: BackendErrorResponse): ApiError {
  if (isDjangoNotFoundError(errorResponse)) {
    // Django Not Found Error
    return {
      status: 404,
      message: "Resource not found.",
    };
  }

  if (isDjangoNinjaErrorResponse(errorResponse)) {
    // Django Ninja Error Response
    return {
      status: 400,
      message: errorResponse.message,
    };
  }

  if (isDjango422Response(errorResponse)) {
    // Django 422 Error Response
    return {
      status: 422,
      message: errorResponse.detail.map((err) => err.ctx.error).join(", "),
    };
  }

  if (isDjangoErrorResponseDetailArray(errorResponse)) {
    // Django Error Response Detail Array
    return {
      status: 400, // Assuming Bad Request; adjust as needed
      message: errorResponse.map((err) => err.ctx.error).join(", "),
    };
  }

  if (isValidationError(errorResponse)) {
    const error = errorResponse as {
      status: number;
      message: string;
      code?: string;
      errors?: unknown;
    };
    // Validation Error
    return {
      status: error.status,
      message: error.message,
      code: error.code,
      details: error.errors,
    };
  }

  if (isApiError(errorResponse)) {
    const error = errorResponse as {
      status: number;
      message: string;
      code?: string;
      details?: unknown;
    };
    // ApiError
    return {
      status: error.status,
      message: error.message,
      code: error.code,
      details: error.details,
    };
  }

  // Fallback for any other unexpected error structure
  return {
    status: 500,
    message: "An unexpected error occurred.",
  };
}

/**
 * Centralized fetch wrapper with CSRF token handling and error management.
 * Automatically includes 'X-CSRFToken' header for non-GET requests.
 * @param url The URL to fetch.
 * @param init Optional fetch configuration.
 * @returns The response data parsed as JSON.
 * @throws {FetchError} If the network response is not ok.
 */
export async function safeFetch<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  try {
    const config: RequestInit = {
      ...init,
      credentials: "include", // Ensure cookies are sent with the request
      headers: {
        ...(init?.headers || {}),
      },
    };

    // Include CSRF token for non-GET requests
    if (config.method && config.method.toUpperCase() !== "GET") {
      const csrfToken = await getCSRFToken();

      // Ensure headers are of type Record<string, string> for dynamic keys
      const headers = config.headers as Record<string, string>;

      headers["X-CSRFToken"] = csrfToken;

      // Set 'Content-Type' to 'application/json' if not already set
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }

      config.headers = headers;
    }

    const res = await fetch(url, config);

    if (!res.ok) {
      let errorInfo: BackendErrorResponse | null = null;

      if (res.headers.get("Content-Type")?.includes("application/json")) {
        try {
          errorInfo = await res.json();
        } catch {
          console.error("Failed to parse error response as JSON");
        }
      }

      const normalizedError = errorInfo
        ? normalizeError(errorInfo)
        : {
            status: res.status,
            message: res.statusText || "An unknown error occurred.",
          };

      throw new FetchError(
        normalizedError.message,
        normalizedError.status,
        normalizedError
      );
    }

    // Handle no content response
    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error("safeFetch error:", error);
    if (error instanceof FetchError) {
      throw error;
    }
    // Wrap other errors into FetchError
    throw new FetchError("Network error occurred");
  }
}
