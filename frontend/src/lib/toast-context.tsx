"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { LuX, LuCheck, LuTriangleAlert, LuInfo } from "react-icons/lu";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  onClick?: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, onClick?: () => void) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info", onClick?: () => void) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type, onClick }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-24 lg:bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => {
              toast.onClick?.();
              removeToast(toast.id);
            }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border cursor-pointer transition-all duration-300 animate-in slide-in-from-right-4 min-w-[280px] max-w-[400px] ${
              toast.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                : toast.type === "error"
                ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                : "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
            }`}
          >
            <span className="flex-shrink-0">
              {toast.type === "success" ? <LuCheck size={18} /> : toast.type === "error" ? <LuTriangleAlert size={18} /> : <LuInfo size={18} />}
            </span>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
              className="flex-shrink-0 opacity-60 hover:opacity-100"
            >
              <LuX size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
