"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type AuthMode = "login" | "register";

interface AuthModalContextType {
  isOpen: boolean;
  mode: AuthMode;
  open: (mode?: AuthMode) => void;
  close: () => void;
  toggle: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  const open = useCallback((m?: AuthMode) => {
    setMode(m ?? "login");
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
  }, []);

  return (
    <AuthModalContext.Provider value={{ isOpen, mode, open, close, toggle }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
