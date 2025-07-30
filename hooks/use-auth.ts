import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  loginUser,
  googleLoginUser,
  registerUser,
  logoutUser,
  refreshUser,
  setAuthModalOpen,
  setLogoutModalOpen,
  clearError,
} from "@/store/auth/auth.slice";
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectIsInitialized,
  selectAuthModalOpen,
  selectLogoutModalOpen,
  selectUserDisplayName,
  selectUserInitials,
  selectIsAuthReady,
} from "@/store/auth/auth.selectors";

/**
 * Custom hook that provides auth functionality and state
 * This is the main interface for components to interact with auth
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isInitialized = useAppSelector(selectIsInitialized);
  const authModalOpen = useAppSelector(selectAuthModalOpen);
  const logoutModalOpen = useAppSelector(selectLogoutModalOpen);
  const userDisplayName = useAppSelector(selectUserDisplayName);
  const userInitials = useAppSelector(selectUserInitials);
  const isAuthReady = useAppSelector(selectIsAuthReady);

  // Actions
  const login = useCallback(
    (email: string, password: string) =>
      dispatch(loginUser({ email, password })),
    [dispatch]
  );

  const googleLogin = useCallback(
    (token: string) => dispatch(googleLoginUser(token)),
    [dispatch]
  );

  const register = useCallback(
    (data: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    }) => dispatch(registerUser(data)),
    [dispatch]
  );

  const logout = useCallback(() => dispatch(logoutUser()), [dispatch]);

  const refresh = useCallback(() => dispatch(refreshUser()), [dispatch]);

  const openAuthModal = useCallback(
    () => dispatch(setAuthModalOpen(true)),
    [dispatch]
  );

  const closeAuthModal = useCallback(
    () => dispatch(setAuthModalOpen(false)),
    [dispatch]
  );

  const openLogoutModal = useCallback(
    () => dispatch(setLogoutModalOpen(true)),
    [dispatch]
  );

  const closeLogoutModal = useCallback(
    () => dispatch(setLogoutModalOpen(false)),
    [dispatch]
  );

  const clearAuthError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    isInitialized,
    authModalOpen,
    logoutModalOpen,
    userDisplayName,
    userInitials,
    isAuthReady,

    // Actions
    login,
    googleLogin,
    register,
    logout,
    refresh,
    openAuthModal,
    closeAuthModal,
    openLogoutModal,
    closeLogoutModal,
    clearAuthError,
  };
};

// Hook for components that need to check if user has specific permissions
export const useAuthGuard = () => {
  const { isAuthenticated, isInitialized } = useAuth();

  const requireAuth = useCallback(() => {
    if (!isAuthenticated && isInitialized) {
      throw new Error("Authentication required");
    }
  }, [isAuthenticated, isInitialized]);

  const isLoading = !isInitialized;

  return {
    isAuthenticated,
    isInitialized,
    isLoading,
    requireAuth,
  };
};

// Hook for conditional rendering based on auth state
export const useAuthStatus = () => {
  const { isAuthenticated, isInitialized, loading } = useAuth();

  return {
    isLoggedIn: isAuthenticated,
    isLoggedOut: !isAuthenticated && isInitialized,
    isLoading: loading || !isInitialized,
    isReady: isInitialized && !loading,
  };
};
