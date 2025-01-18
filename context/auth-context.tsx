// ruchky/context/auth-context.tsx
"use client"; // This file is a client component

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  fetchCSRFToken,
  fetchCurrentUser,
  loginUser,
  logoutUser,
} from "@/lib/api/auth";
import type { User } from "@/lib/types/user";

/**
 * Defines the shape of our AuthContext, controlling the user + login/logout, etc.
 */
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

/**
 * Initialize a React Context for Auth. 
 * Default value: no user, still loading, no-op methods.
 */
const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

/**
 * The AuthProvider wraps your app (in layout.tsx) to share user state across all pages.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Only run once on client mount — fetch CSRF + user if session is valid.
   */
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        await fetchCSRFToken();
        const me = await fetchCurrentUser(); // returns User or null
        if (!ignore) {
          setUser(me);
        }
      } catch (err) {
        console.error("AuthProvider init error:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    await loginUser(email, password);
    // now we have a valid session, so fetch user info:
    const me = await fetchCurrentUser();
    setUser(me);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const refreshUser = async () => {
    const me = await fetchCurrentUser();
    setUser(me);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to easily consume AuthContext in any component.
 */
export function useAuth() {
  return useContext(AuthContext);
}
