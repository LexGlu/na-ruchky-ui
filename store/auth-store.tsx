"use client";

// TODO: Fix type errors or replace zustand with another state management library. This is a temporary workaround.

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
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
  setLogOutModalOpen: (isLogoutModalOpen: boolean) => void;
  setAuthModalOpen: (isAuthModalOpen: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      isLogoutModalOpen: false,
      isAuthModalOpen: false,
      setLoading: (loading) => set({ loading }),
      setUser: (user) => set({ user }),
      login: async (email: string, password: string) => {
        await authService.loginUser(email, password);
        const user = await authService.fetchCurrentUser();
        set({ user });
      },
      logout: async () => {
        await authService.logoutUser();
        set({ user: null });
      },
      refreshUser: async () => {
        const user = await authService.fetchCurrentUser();
        set({ user });
      },
      setLogOutModalOpen: (isLogoutModalOpen: boolean) =>
        set({ isLogoutModalOpen }),
      setAuthModalOpen: (isAuthModalOpen: boolean) => set({ isAuthModalOpen }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function useAuth() {
  return useAuthStore();
}
