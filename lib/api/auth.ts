import { safeFetch, BASE_API_URL } from "@/lib/api/request";
import { User } from "@/lib/types/user";
import { FetchError } from "@/lib/types/errors";

/**
 * Data structure for user registration.
 */
interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

/**
 * Authentication Service encapsulating all auth-related API calls.
 * Adheres to the Single Responsibility Principle by handling only authentication logic.
 */
class AuthService {
  /**
   * Logs in the user with email and password.
   * @param email User's email
   * @param password User's password
   */
  async loginUser(email: string, password: string): Promise<void> {
    try {
      await safeFetch<{ message: string }>(
        `${BASE_API_URL}/api/v1/auth/login`,
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  /**
   * Logs out the current user.
   */
  async logoutUser(): Promise<void> {
    try {
      await safeFetch<{ message: string }>(
        `${BASE_API_URL}/api/v1/auth/logout`,
        {
          method: "POST",
        }
      );
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  /**
   * Registers a new user account.
   * @param data Registration data
   */
  async registerUser(data: RegisterData): Promise<void> {
    const payload = {
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
    };
    try {
      await safeFetch<{ message: string }>(
        `${BASE_API_URL}/api/v1/auth/register`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  /**
   * Fetches the currently logged-in user.
   * @returns User object or null if not authenticated
   */
  async fetchCurrentUser(): Promise<User | null> {
    try {
      return await safeFetch<User>(`${BASE_API_URL}/api/v1/users/me`, {
        method: "GET",
      });
    } catch (error) {
      const fetchError = error as FetchError;
      if (fetchError.status === 401) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Handles authentication-related errors by re-throwing them or processing as needed.
   * @param error The error thrown during authentication operations.
   */
  private handleAuthError(error: unknown): never {
    if (error instanceof FetchError) {
      console.error("Authentication error:", error.message, error.info);
      throw error;
    }
    // Wrapper for unexpected errors
    throw new FetchError("An unexpected error occurred during authentication.");
  }
}

export const authService = new AuthService();
