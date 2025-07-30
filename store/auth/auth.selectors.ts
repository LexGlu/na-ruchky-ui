import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "@/store/root-reducer";

// Base selectors
export const selectAuthState = (state: RootState) => state.auth;

// Memoized selectors
export const selectUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);

export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);

export const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth.loading
);

export const selectAuthError = createSelector(
  [selectAuthState],
  (auth) => auth.error
);

export const selectIsInitialized = createSelector(
  [selectAuthState],
  (auth) => auth.isInitialized
);

export const selectAuthModalOpen = createSelector(
  [selectAuthState],
  (auth) => auth.modals.isAuthModalOpen
);

export const selectLogoutModalOpen = createSelector(
  [selectAuthState],
  (auth) => auth.modals.isLogoutModalOpen
);

// Computed selectors
export const selectUserDisplayName = createSelector([selectUser], (user) => {
  if (!user) return null;
  return user.first_name || user.email;
});

export const selectUserInitials = createSelector([selectUser], (user) => {
  if (!user) return "";

  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }

  if (user.first_name) {
    return user.first_name[0].toUpperCase();
  }

  if (user.email) {
    return user.email[0].toUpperCase();
  }

  return "U";
});

export const selectIsAuthReady = createSelector(
  [selectIsInitialized, selectAuthLoading],
  (isInitialized, loading) => isInitialized && !loading
);

// Complex selectors for UI state
export const selectShouldShowAuthModal = createSelector(
  [selectAuthModalOpen, selectIsAuthenticated],
  (isModalOpen, isAuthenticated) => isModalOpen && !isAuthenticated
);

export const selectCanLogout = createSelector(
  [selectIsAuthenticated, selectAuthLoading],
  (isAuthenticated, loading) => isAuthenticated && !loading
);

// Hook for easy access to common auth data
export const useAuthSelectors = () => ({
  user: selectUser,
  isAuthenticated: selectIsAuthenticated,
  loading: selectAuthLoading,
  error: selectAuthError,
  isInitialized: selectIsInitialized,
  authModalOpen: selectAuthModalOpen,
  logoutModalOpen: selectLogoutModalOpen,
  userDisplayName: selectUserDisplayName,
  userInitials: selectUserInitials,
  isAuthReady: selectIsAuthReady,
  shouldShowAuthModal: selectShouldShowAuthModal,
  canLogout: selectCanLogout,
});
