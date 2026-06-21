"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { api, setAccessToken, getAccessToken } from "./api";
import type { User } from "./types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const u = await api.getMe();
        if (!cancelled) setUser(u);
        return;
      } catch {
        // cookie may be stale — try refreshing the token
      }

      try {
        const stored = getAccessToken();
        if (!stored) return;

        const { access_token } = await api.refreshToken();
        setAccessToken(access_token);

        const u = await api.getMe();
        if (!cancelled) setUser(u);
      } catch {
        // both cookie and refresh failed — logged out
      }
    }

    init().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user, access_token } = await api.login(email, password);
    setAccessToken(access_token);
    setUser(user);
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      username: string,
      displayName: string
    ) => {
      const { user, access_token } = await api.register(
        email,
        password,
        username,
        displayName
      );
      setAccessToken(access_token);
      setUser(user);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* ignore server errors — clear state anyway */
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
