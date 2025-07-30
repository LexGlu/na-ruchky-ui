"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor, useAppDispatch, useAppSelector } from "@/store";
import { initializeAuth } from "@/store/auth/auth.slice";
import {
  selectIsInitialized,
  selectIsAuthenticated,
  selectUser,
} from "@/store/auth/auth.selectors";

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectIsInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  useEffect(() => {
    const initializeAuthInBackground = async (): Promise<void> => {
      // Only initialize if we haven't already and there's persisted auth data
      if (!isInitialized && (user || isAuthenticated)) {
        try {
          await dispatch(initializeAuth()).unwrap();
        } catch (error) {
          console.warn("Failed to initialize auth:", error);
        }
      }
    };

    // Run initialization in background without blocking render
    initializeAuthInBackground();
  }, [dispatch, isInitialized, user, isAuthenticated]);

  // Always render children immediately - don't wait for auth initialization
  return <>{children}</>;
};

/**
 * Main Redux provider that doesn't block rendering.
 * Public pages will load immediately, improving SEO and user experience.
 */
export const ReduxProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Provider store={store}>
      <PersistGate
        loading={null} // Don't show loader during rehydration
        persistor={persistor}
        onBeforeLift={() => {
          // This runs after rehydration but before rendering
          // We can perform any additional setup here if needed
        }}
      >
        <AuthInitializer>{children}</AuthInitializer>
      </PersistGate>
    </Provider>
  );
};
