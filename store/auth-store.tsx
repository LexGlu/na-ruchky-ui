"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from "@/lib/types/user";
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
} from "@/lib/api/auth";

export interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      setLoading: (loading) => set({ loading }),
      setUser: (user) => set({ user }),
      login: async (email: string, password: string) => {
        await loginUser(email, password);
        const user = await fetchCurrentUser();
        set({ user });
      },
      logout: async () => {
        await logoutUser();
        set({ user: null });
      },
      refreshUser: async () => {
        const user = await fetchCurrentUser();
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      storage: typeof window !== 'undefined'
        ? {
            getItem: (name) => {
              const str = localStorage.getItem(name);
              if (!str) return null;
              return JSON.parse(str);
            },
            setItem: (name, value) => {
              localStorage.setItem(name, JSON.stringify(value));
            },
            removeItem: (name) => localStorage.removeItem(name),
          }
        : undefined,
    }
  )
);

export function useAuth() {
  return useAuthStore();
}
