import ky, { HTTPError, TimeoutError, type KyInstance, type Options } from "ky";
import Cookies from "js-cookie";
import { BASE_API_URL } from "@/lib/api/constants";
import { ApiErrorFactory } from "./errors";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

function isValidHttpMethod(method: string | undefined): method is HttpMethod {
  return (
    method !== undefined &&
    ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].includes(
      method.toUpperCase()
    )
  );
}

/**
 * Retrieves CSRF token from cookies or fetches it from the backend if not present.
 */
async function getCSRFToken(): Promise<string> {
  let csrfToken = Cookies.get("csrftoken");

  if (!csrfToken) {
    try {
      await ky.get(`${BASE_API_URL}/api/v1/auth/csrf`, {
        credentials: "include",
      });

      csrfToken = Cookies.get("csrftoken");

      if (!csrfToken) {
        throw new Error("CSRF token not found in response");
      }
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        throw ApiErrorFactory.createFromResponse(null, error.response.status);
      }
      throw ApiErrorFactory.createFromResponse(null, 500);
    }
  }

  return csrfToken;
}

/**
 * Creates a configured ky instance with enhanced error handling
 */
function createApiClient(): KyInstance {
  return ky.create({
    prefixUrl: BASE_API_URL,
    credentials: "include",
    timeout: 30000,

    retry: {
      limit: 3,
      methods: ["get", "put", "head", "delete", "options", "trace"],
      statusCodes: [408, 413, 429, 500, 502, 503, 504],
      backoffLimit: 3000,
    },

    headers: {
      Accept: "application/json",
    },

    hooks: {
      beforeRequest: [
        async (request) => {
          if (request.method !== "GET") {
            try {
              const csrfToken = await getCSRFToken();
              request.headers.set("X-CSRFToken", csrfToken);

              if (!request.headers.has("Content-Type") && request.body) {
                request.headers.set("Content-Type", "application/json");
              }
            } catch (error) {
              console.error("Failed to get CSRF token:", error);
              throw error;
            }
          }
        },
      ],

      beforeRetry: [
        async ({ request, error, retryCount }) => {
          console.warn(
            `Retrying request to ${request.url} (attempt ${retryCount + 1}):`,
            error
          );

          if (error instanceof HTTPError && error.response.status === 403) {
            Cookies.remove("csrftoken");
          }
        },
      ],

      beforeError: [
        async (error: unknown) => {
          if (error instanceof HTTPError) {
            let errorData: unknown = null;

            const contentType = error.response.headers.get("Content-Type");
            if (contentType?.includes("application/json")) {
              try {
                errorData = await error.response.json();
              } catch (parseError) {
                console.error(
                  "Failed to parse error response as JSON:",
                  parseError
                );
              }
            }

            // Use the centralized error factory
            throw ApiErrorFactory.createFromResponse(
              errorData,
              error.response.status
            );
          }

          if (error instanceof TimeoutError) {
            throw ApiErrorFactory.createFromResponse(
              { message: "Request timeout" },
              408
            );
          }

          // Network errors
          throw ApiErrorFactory.createFromResponse(
            { message: "Network error occurred" },
            0
          );
        },
      ],
    },
  });
}

// Create the main API client instance
const apiClient = createApiClient();

/**
 * Enhanced API client with centralized error handling
 */
export const api = {
  async request<T>(url: string, options?: Options): Promise<T> {
    try {
      return await apiClient(url, options).json<T>();
    } catch (error: unknown) {
      console.error("API request error:", error);
      throw error; // Will be a BaseApiError thanks to beforeError hook
    }
  },

  async get<T>(url: string, options?: Options): Promise<T> {
    return this.request<T>(url, { ...options, method: "GET" });
  },

  async post<T>(url: string, json?: unknown, options?: Options): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: "POST",
      json,
    });
  },

  async put<T>(url: string, json?: unknown, options?: Options): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: "PUT",
      json,
    });
  },

  async patch<T>(url: string, json?: unknown, options?: Options): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: "PATCH",
      json,
    });
  },

  async delete<T>(url: string, options?: Options): Promise<T> {
    return this.request<T>(url, { ...options, method: "DELETE" });
  },

  async stream(url: string, options?: Options): Promise<Response> {
    return apiClient(url, options);
  },

  async text(url: string, options?: Options): Promise<string> {
    return apiClient(url, options).text();
  },

  async blob(url: string, options?: Options): Promise<Blob> {
    return apiClient(url, options).blob();
  },

  async arrayBuffer(url: string, options?: Options): Promise<ArrayBuffer> {
    return apiClient(url, options).arrayBuffer();
  },

  create(options: Options): KyInstance {
    return apiClient.create(options);
  },

  extend(options: Options): KyInstance {
    return apiClient.extend(options);
  },
};

// Backward compatibility (deprecated)
export async function safeFetch<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  console.warn(
    "safeFetch is deprecated. Use api.request() or specific methods instead."
  );

  const options: Options = {
    method: isValidHttpMethod(init?.method) ? init.method : "GET",
    headers: init?.headers,
    body: init?.body,
  };

  return api.request<T>(url, options);
}

export default api;
