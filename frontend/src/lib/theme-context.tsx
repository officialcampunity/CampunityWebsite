"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export type ThemeMode = "system" | "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  resolved: boolean;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(resolvedDark: boolean) {
  document.documentElement.classList.toggle("dark", resolvedDark);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme-mode") || localStorage.getItem("theme");
    let m: ThemeMode = "system";
    if (stored === "dark") m = "dark";
    else if (stored === "light") m = "light";
    setModeState(m);

    if (m === "system") {
      const d = getSystemDark();
      setResolved(d);
      applyTheme(d);
    } else {
      const d = m === "dark";
      setResolved(d);
      applyTheme(d);
    }
  }, []);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function handler(e: MediaQueryListEvent) {
      setResolved(e.matches);
      applyTheme(e.matches);
    }
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem("theme-mode", m);
    localStorage.removeItem("theme");
    if (m === "system") {
      const d = getSystemDark();
      setResolved(d);
      applyTheme(d);
    } else {
      const d = m === "dark";
      setResolved(d);
      applyTheme(d);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
