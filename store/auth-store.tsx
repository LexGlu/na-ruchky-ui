"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/lib/types/user";
import { authService } from "@/lib/api/auth";

export interface AuthState {
  user: User | null;
  loading: boolean;
  isLogoutModalOpen: boolean;
  isAuthModalOpen: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
  setLogOutModalOpen: (isLogoutModalOpen: boolean) => void;
  setAuthModalOpen: (isAuthModalOpen: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      isLogoutModalOpen: false,
      isAuthModalOpen: false,

      setLoading: (loading) => set({ loading }),

      setUser: (user) => set({ user }),

      login: async (email: string, password: string) => {
        try {
          set({ loading: true });
          await authService.loginUser(email, password);
          const user = await authService.fetchCurrentUser();
          set({ user, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      googleLogin: async (token: string) => {
        try {
          set({ loading: true });
          await authService.googleLogin(token);
          const user = await authService.fetchCurrentUser();
          set({ user, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ loading: true });
          await authService.logoutUser();
          set({ user: null, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      refreshUser: async () => {
        try {
          if (!get().loading) set({ loading: true });
          const user = await authService.fetchCurrentUser();
          set({ user, loading: false });
        } catch (error) {
          set({ user: null, loading: false });
        }
      },

      setLogOutModalOpen: (isLogoutModalOpen) => set({ isLogoutModalOpen }),

      setAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        // Don't persist these state properties
        // loading: state.loading,
        // isLogoutModalOpen: state.isLogoutModalOpen,
        // isAuthModalOpen: state.isAuthModalOpen,
      }),
    }
  )
);

export function useAuth() {
  return useAuthStore();
}
