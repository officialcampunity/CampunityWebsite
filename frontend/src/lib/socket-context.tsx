"use client";

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./auth-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

interface SocketContextType {
  chatSocket: Socket | null;
  notificationSocket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  chatSocket: null,
  notificationSocket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [chatSocket, setChatSocket] = useState<Socket | null>(null);
  const [notificationSocket, setNotificationSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const chatRef = useRef<Socket | null>(null);
  const notifRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      chatRef.current?.disconnect();
      notifRef.current?.disconnect();
      chatRef.current = null;
      notifRef.current = null;
      setChatSocket(null);
      setNotificationSocket(null);
      setIsConnected(false);
      return;
    }

    const getToken = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
        if (!res.ok) return null;
        return "";
      } catch {
        return null;
      }
    };

    getToken().then(() => {
      const chat = io(`${SOCKET_URL}/chat`, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        auth: { token: document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1") },
      });
      const notif = io(`${SOCKET_URL}/notifications`, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        auth: { token: document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1") },
      });

      chat.on("connect", () => setIsConnected(true));
      chat.on("disconnect", () => setIsConnected(false));
      notif.on("connect", () => {});

      chatRef.current = chat;
      notifRef.current = notif;
      setChatSocket(chat);
      setNotificationSocket(notif);
    });

    return () => {
      chatRef.current?.disconnect();
      notifRef.current?.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ chatSocket, notificationSocket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
