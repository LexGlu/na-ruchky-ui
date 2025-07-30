import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store";
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
  selectShouldShowAuthModal,
  selectCanLogout,
} from "@/store/auth/auth.selectors";
import { initializeAuth } from "@/store/auth/auth.slice";

/**
 * Main auth hook for components that need auth state.
 * Does not block rendering - auth state may be loading initially.
 */
export function useAuth() {
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
  const shouldShowAuthModal = useAppSelector(selectShouldShowAuthModal);
  const canLogout = useAppSelector(selectCanLogout);

  return {
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
    shouldShowAuthModal,
    canLogout,
    // Quick access properties
    userId: user?.id,
    userEmail: user?.email,
  };
}

/**
 * Hook for components that need to wait for auth initialization.
 * Use this when you specifically need to know the auth status before rendering.
 * Most components should use useAuth() instead.
 */
export function useAuthInitialized() {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const ensureAuthInitialized = async () => {
      if (!auth.isInitialized && !hasInitialized) {
        setHasInitialized(true);
        try {
          await dispatch(initializeAuth()).unwrap();
        } catch (error) {
          console.warn("Auth initialization failed:", error);
        }
      }
    };

    ensureAuthInitialized();
  }, [dispatch, auth.isInitialized, hasInitialized]);

  return {
    ...auth,
    isReady: auth.isInitialized,
  };
}

/**
 * Hook for protected routes/components that require authentication.
 * This will trigger auth initialization if needed and provide loading state.
 */
export function useRequireAuth() {
  const auth = useAuthInitialized();

  useEffect(() => {
    if (auth.isReady && !auth.isAuthenticated) {
      // Auth is ready and user is not authenticated
      // Components can handle this by showing login UI or redirecting
      console.warn("Authentication required");
    }
  }, [auth.isAuthenticated, auth.isReady]);

  return {
    ...auth,
    // Helper flags for protected components
    needsAuth: auth.isReady && !auth.isAuthenticated,
    isProtectedReady: auth.isReady && auth.isAuthenticated,
  };
}
