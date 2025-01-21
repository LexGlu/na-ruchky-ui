import Cookies from 'js-cookie';

/**
 * Custom error class to handle fetch-related errors.
 */
export class FetchError extends Error {
  status?: number;
  info?: unknown;

  constructor(message: string) {
    super(message);
    this.name = 'FetchError';
  }
}

/**
 * Base URL for the API.
 * Ensure that NEXT_PUBLIC_API_BASE_URL is set in your environment variables.
 */
export const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * Retrieves CSRF token from cookies or fetches it from the backend if not present.
 * @returns The CSRF token as a string.
 * @throws {FetchError} If fetching the CSRF token fails.
 */
async function getCSRFToken(): Promise<string> {
  let csrfToken = Cookies.get('csrftoken');

  if (!csrfToken) {
    const response = await fetch(`${BASE_API_URL}/api/v1/auth/csrf`, {
      method: 'GET',
      credentials: 'include', // Ensure cookies are included in the request
    });

    if (response.ok) {
      // The backend should set the 'csrftoken' cookie in the response
      csrfToken = Cookies.get('csrftoken');
      console.log('CSRF token fetched:', csrfToken);
      if (!csrfToken) {
        throw new FetchError('CSRF token not found in response');
      }
    } else {
      throw new FetchError('Failed to fetch CSRF token');
    }
  }

  return csrfToken;
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
      credentials: 'include', // Ensure cookies are sent with the request
      headers: {
        ...(init?.headers || {}),
      },
    };

    // Include CSRF token for non-GET requests
    if (config.method && config.method.toUpperCase() !== 'GET') {
      const csrfToken = await getCSRFToken();

      // Ensure headers are of type Record<string, string> for dynamic keys
      const headers = config.headers as Record<string, string>;

      headers['X-CSRFToken'] = csrfToken;

      // Set 'Content-Type' to 'application/json' if not already set
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      config.headers = headers;
    }

    const res = await fetch(url, config);

    if (!res.ok) {
      const error = new FetchError('Network response was not ok');
      error.status = res.status;
      try {
        error.info = await res.json();
      } catch {
        console.error('Failed to parse error response');
      }
      throw error;
    }

    // Handle no content response
    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error('safeFetch error:', error);
    throw error;
  }
}
