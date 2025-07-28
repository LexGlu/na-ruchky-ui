"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authService } from "@/lib/api/auth";
import { User } from "@/lib/types/user";
import { BaseApiError, UnauthorizedError } from "@/lib/api/errors";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Initialize user on mount
  useEffect(() => {
    async function initializeUser() {
      try {
        const currentUser = await authService.fetchCurrentUser();
        setUser(currentUser);
      } catch (err) {
        // Not authenticated is expected, don't set error
        if (!(err instanceof UnauthorizedError)) {
          console.error("Failed to fetch current user:", err);
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initializeUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.loginUser(email, password);
      setUser(response.user);
    } catch (err) {
      const errorMessage =
        err instanceof BaseApiError
          ? err.message
          : "Login failed. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.logoutUser();
      setUser(null);
    } catch (err) {
      const errorMessage =
        err instanceof BaseApiError
          ? err.message
          : "Logout failed. Please try again.";
      setError(errorMessage);
      // Still clear user data locally even if logout request fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.registerUser(data);
      setUser(response.user);
    } catch (err) {
      const errorMessage =
        err instanceof BaseApiError
          ? err.message
          : "Registration failed. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser((prev) => (prev ? { ...prev, ...userData } : null));
    }
  };

  const refreshUser = async () => {
    try {
      setError(null);
      const currentUser = await authService.fetchCurrentUser();
      setUser(currentUser);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        setUser(null);
      } else {
        const errorMessage =
          err instanceof BaseApiError
            ? err.message
            : "Failed to refresh user data.";
        setError(errorMessage);
      }
    }
  };

  const value: UserContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateUser,
    refreshUser,
    error,
    clearError,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Custom hook to use the user context
export function useUser(): UserContextType {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}

// Optional: Hook for components that need to know auth status without full user data
export function useAuth() {
  const { isAuthenticated, isLoading, user } = useUser();

  return {
    isAuthenticated,
    isLoading,
    userId: user?.id,
    userEmail: user?.email,
  };
}

// Hook for protected routes/components
export function useRequireAuth() {
  const { isAuthenticated, isLoading, user } = useUser();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login or show auth modal
      // This could dispatch an action to show login modal
      console.warn("Authentication required");
    }
  }, [isAuthenticated, isLoading]);

  return {
    isAuthenticated,
    isLoading,
    user,
    isReady: !isLoading && isAuthenticated,
  };
}
