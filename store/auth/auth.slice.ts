import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "@/lib/api/auth";
import type { User } from "@/lib/types/user";
import { BaseApiError, UnauthorizedError } from "@/lib/api/errors";

import type {
  AuthState,
  LoginCredentials,
  RegisterData,
} from "@/store/auth/auth.types";

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isInitialized: false,
  modals: {
    isAuthModalOpen: false,
    isLogoutModalOpen: false,
  },
};

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      await authService.loginUser(credentials.email, credentials.password);
      const user = await authService.fetchCurrentUser();
      return user;
    } catch (error) {
      const apiError = error as BaseApiError;
      return rejectWithValue(apiError.message || "Login failed");
    }
  }
);

export const googleLoginUser = createAsyncThunk(
  "auth/googleLoginUser",
  async (token: string, { rejectWithValue }) => {
    try {
      await authService.googleLogin(token);
      const user = await authService.fetchCurrentUser();
      return user;
    } catch (error) {
      const apiError = error as BaseApiError;
      return rejectWithValue(apiError.message || "Google login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.registerUser(data);
      return response;
    } catch (error) {
      const apiError = error as BaseApiError;
      return rejectWithValue(apiError.message || "Registration failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logoutUser();
      return null;
    } catch (error) {
      const apiError = error as BaseApiError;
      return rejectWithValue(apiError.message || "Logout failed");
    }
  }
);

export const refreshUser = createAsyncThunk(
  "auth/refreshUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.fetchCurrentUser();
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return null;
      }
      const apiError = error as BaseApiError;
      return rejectWithValue(apiError.message || "Failed to refresh user");
    }
  }
);

export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async () => {
    try {
      const user = await authService.fetchCurrentUser();
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        // User is not authenticated, this is fine
        return null;
      }
      // For other errors, we still want to mark as initialized
      return null;
    }
  }
);

// Auth slice
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuthModalOpen: (state, action: PayloadAction<boolean>) => {
      state.modals.isAuthModalOpen = action.payload;
    },
    setLogoutModalOpen: (state, action: PayloadAction<boolean>) => {
      state.modals.isLogoutModalOpen = action.payload;
    },
    forceLogout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.modals.isAuthModalOpen = false;
      state.modals.isLogoutModalOpen = false;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.modals.isAuthModalOpen = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
      });

    // Google Login
    builder
      .addCase(googleLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.modals.isAuthModalOpen = false;
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        // Don't set user as authenticated after registration
        // They need to verify email first
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.modals.isLogoutModalOpen = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Even if logout fails on server, clear local state
        state.user = null;
        state.isAuthenticated = false;
        state.modals.isLogoutModalOpen = false;
      });

    // Refresh user
    builder
      .addCase(refreshUser.pending, (state) => {
        // Only show loading if not already initialized to avoid blocking UI
        if (!state.isInitialized) {
          state.loading = true;
        }
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(refreshUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      });

    // Initialize auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        // Don't show loading during initialization to avoid blocking public pages
        state.loading = false;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      });
  },
});

export const {
  setLoading,
  setUser,
  clearError,
  setAuthModalOpen,
  setLogoutModalOpen,
  forceLogout,
  setInitialized,
} = authSlice.actions;
