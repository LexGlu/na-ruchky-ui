import api from "@/lib/api/request";
import {
  BaseApiError,
  ValidationError,
  UnauthorizedError,
  ConflictError,
  ServerError,
  NetworkError,
} from "@/lib/api/errors";
import { User } from "@/lib/types/user";

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
 * Response types for authentication operations
 */
interface AuthResponse {
  message: string;
  user?: User;
  token?: string;
}

interface LoginResponse {
  message: string;
  user: User;
  access_token?: string;
}

/**
 * Enhanced Authentication Service using the new centralized API system.
 * Provides clean error handling and type safety for all auth operations.
 */
class AuthService {
  /**
   * Logs in the user with email and password.
   * @param email User's email
   * @param password User's password
   * @returns Login response with user data
   */
  async loginUser(email: string, password: string): Promise<LoginResponse> {
    try {
      return await api.post<LoginResponse>("api/v1/auth/login", {
        email,
        password,
      });
    } catch (error) {
      throw this.enhanceAuthError(error, "login");
    }
  }

  /**
   * Logs out the current user.
   */
  async logoutUser(): Promise<void> {
    try {
      await api.post<AuthResponse>("api/v1/auth/logout");
    } catch (error) {
      throw this.enhanceAuthError(error, "logout");
    }
  }

  /**
   * Registers a new user account.
   * @param data Registration data
   * @returns Registration response with user data
   */
  async registerUser(data: RegisterData): Promise<LoginResponse> {
    const payload = {
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
    };

    try {
      return await api.post<LoginResponse>("api/v1/auth/register", payload);
    } catch (error) {
      throw this.enhanceAuthError(error, "registration");
    }
  }

  /**
   * Authenticate user using Google OAuth token
   * @param token Google OAuth access token
   * @returns Login response with user data
   */
  async googleLogin(token: string): Promise<LoginResponse> {
    try {
      return await api.post<LoginResponse>("api/v1/auth/google-login", {
        token,
      });
    } catch (error) {
      throw this.enhanceAuthError(error, "Google login");
    }
  }

  /**
   * Fetches the currently logged-in user.
   * @returns User object or null if not authenticated
   */
  async fetchCurrentUser(): Promise<User | null> {
    try {
      return await api.get<User>("api/v1/users/me");
    } catch (error) {
      // Handle unauthenticated users gracefully
      if (error instanceof UnauthorizedError) {
        return null;
      }
      throw this.enhanceAuthError(error, "fetch current user");
    }
  }

  /**
   * Request password reset email
   * @param email User's email address
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      return await api.post<{ message: string }>(
        "api/v1/auth/password-reset/",
        {
          email,
        }
      );
    } catch (error) {
      throw this.enhanceAuthError(error, "password reset request");
    }
  }

  /**
   * Confirm password reset with token
   * @param token Reset token from email
   * @param newPassword New password
   */
  async confirmPasswordReset(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      return await api.post<{ message: string }>(
        "api/v1/auth/password-reset/confirm",
        {
          token,
          new_password: newPassword,
        }
      );
    } catch (error) {
      throw this.enhanceAuthError(error, "password reset");
    }
  }

  /**
   * Change user password
   * @param currentPassword Current password
   * @param newPassword New password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      return await api.post<{ message: string }>(
        "api/v1/auth/change-password",
        {
          current_password: currentPassword,
          new_password: newPassword,
        }
      );
    } catch (error) {
      throw this.enhanceAuthError(error, "password change");
    }
  }

  /**
   * Verify email address with token
   * @param token Verification token from email
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      return await api.post<{ message: string }>("api/v1/auth/verify-email", {
        token,
      });
    } catch (error) {
      throw this.enhanceAuthError(error, "email verification");
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<{ message: string }> {
    try {
      return await api.post<{ message: string }>(
        "api/v1/auth/resend-verification"
      );
    } catch (error) {
      throw this.enhanceAuthError(error, "resend email verification");
    }
  }

  /**
   * Refresh authentication token
   * @param refreshToken Refresh token
   */
  async refreshToken(
    refreshToken: string
  ): Promise<{ access_token: string; refresh_token?: string }> {
    try {
      return await api.post<{ access_token: string; refresh_token?: string }>(
        "api/v1/auth/refresh",
        {
          refresh_token: refreshToken,
        }
      );
    } catch (error) {
      throw this.enhanceAuthError(error, "token refresh");
    }
  }

  /**
   * Enhanced error handler that provides context-specific error messages
   * @param error The error from the API
   * @param operation The operation that failed (for context)
   */
  private enhanceAuthError(error: unknown, operation: string): BaseApiError {
    if (error instanceof ValidationError) {
      // Add operation context to validation errors
      return new ValidationError(
        `${operation} failed: ${error.message}`,
        error.fieldErrors,
        error.details
      );
    }

    if (error instanceof UnauthorizedError) {
      return new UnauthorizedError(
        `${operation} failed: Invalid credentials or session expired`
      );
    }

    if (error instanceof ConflictError) {
      // Common in registration when user already exists
      return new ConflictError(
        `${operation} failed: ${error.message}`,
        error.details
      );
    }

    if (error instanceof NetworkError) {
      return new NetworkError(`${operation} failed: Network connection error`);
    }

    if (error instanceof ServerError) {
      return new ServerError(
        `${operation} failed: Server error occurred`,
        error.details
      );
    }

    if (error instanceof BaseApiError) {
      // Re-throw other API errors as-is
      return error;
    }

    // Fallback for unexpected errors
    console.error(`Unexpected error during ${operation}:`, error);
    return new ServerError(`An unexpected error occurred during ${operation}`);
  }
}

/**
 * Higher-level auth functions with enhanced error handling for common use cases
 */

// Export the main service instance
export const authService = new AuthService();

// Export types for external use
export type { RegisterData, AuthResponse, LoginResponse };
