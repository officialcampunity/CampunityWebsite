"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { api } from "./api";
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

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let retries = 0;

    async function attempt() {
      try {
        const u = await api.getMe();
        if (!cancelled) setUser(u);
        return true;
      } catch {
        return false;
      }
    }

    async function init() {
      // First try: immediate
      let ok = await attempt();
      // Second try: wait 1.5s and retry (catches backend still starting up)
      if (!ok) {
        await delay(1500);
        ok = await attempt();
      }
      // Third try: wait 3s and retry
      if (!ok) {
        await delay(3000);
        await attempt();
      }
    }

    init().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await api.login(email, password);
    setUser(user);
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      username: string,
      displayName: string
    ) => {
      const { user } = await api.register(
        email,
        password,
        username,
        displayName
      );
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
