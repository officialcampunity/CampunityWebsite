"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LuArrowLeft, LuMessageCircle, LuSend } from "react-icons/lu";
import { api } from "@/lib/api";
import { useSocket } from "@/lib/socket-context";
import { SkeletonMessageBubble } from "./ui/Skeleton";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface ChatWindowProps {
  conversationId: string;
  otherUser: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  currentUserId: string;
  onBack?: () => void;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isToday) return time;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${time}`;
}

export default function ChatWindow({ conversationId, otherUser, currentUserId, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { chatSocket } = useSocket();

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setMessages([]);
    api.getMessages(otherUser.id, 1, 50)
      .then((res) => {
        setMessages(res.data.map((m: any) => ({
          id: m.id,
          senderId: m.sender?.id || m.senderId || '',
          content: m.content,
          createdAt: m.createdAt,
        })));
        setTotal(res.total);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [otherUser.id]);

  useEffect(() => {
    if (!chatSocket) return;

    const handleNewMessage = (msg: any) => {
      const senderId = msg.sender?.id || msg.senderId || '';
      if (senderId === otherUser.id || senderId === currentUserId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, {
            id: msg.id,
            senderId,
            content: msg.content,
            createdAt: msg.createdAt,
          }];
        });
      }
    };

    const handleTyping = (data: { conversationId: string; userId: string }) => {
      if (data.userId === otherUser.id) {
        setIsTyping(true);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setIsTyping(false), 2000);
      }
    };

    const handleStopTyping = (data: { conversationId: string; userId: string }) => {
      if (data.userId === otherUser.id) setIsTyping(false);
    };

    chatSocket.on("newMessage", handleNewMessage);
    chatSocket.on("typing", handleTyping);
    chatSocket.on("stopTyping", handleStopTyping);

    return () => {
      chatSocket.off("newMessage", handleNewMessage);
      chatSocket.off("typing", handleTyping);
      chatSocket.off("stopTyping", handleStopTyping);
    };
  }, [chatSocket, otherUser.id, currentUserId]);

  const emitTyping = useCallback(() => {
    if (!chatSocket) return;
    chatSocket.emit("typing", { conversationId, userId: otherUser.id });
    setTimeout(() => {
      chatSocket.emit("stopTyping", { conversationId, userId: otherUser.id });
    }, 2000);
  }, [chatSocket, conversationId, otherUser.id]);

  async function handleLoadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    const prevHeight = containerRef.current?.scrollHeight || 0;
    try {
      const res = await api.getMessages(otherUser.id, page + 1, 50);
      setMessages((prev) => [...res.data.map((m: any) => ({
        id: m.id,
        senderId: m.sender?.id || m.senderId || '',
        content: m.content,
        createdAt: m.createdAt,
      })), ...prev]);
      setPage((p) => p + 1);
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight - prevHeight;
        }
      });
    } catch (e) {
      console.error('Failed to load more messages:', e);
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      if (chatSocket?.connected) {
        chatSocket.emit("sendMessage", { receiverId: otherUser.id, content: input.trim() });
        chatSocket.emit("stopTyping", { conversationId, userId: otherUser.id });
      } else {
        const msg = await api.sendMessage(otherUser.id, input.trim());
        setMessages((prev) => [...prev, {
          id: msg.id,
          senderId: currentUserId,
          content: msg.content,
          createdAt: msg.createdAt,
        }]);
      }
      setInput("");
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-white/10">
        {onBack && (
          <button onClick={onBack} className="mr-1 p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition">
            <LuArrowLeft size={18} />
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {otherUser.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm truncate">{otherUser.name}</p>
          <p className="text-xs text-gray-400 truncate">@{otherUser.username}</p>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <SkeletonMessageBubble key={i} align={i % 2 === 0 ? "right" : "left"} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-3">
              <LuMessageCircle size={24} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">No messages yet</p>
            <p className="text-xs text-gray-300 mt-1">Send a message to start chatting</p>
          </div>
        ) : (
          <>
            {messages.length < total && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="text-xs text-primary hover:underline font-medium disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load earlier messages"}
                </button>
              </div>
            )}
          {messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                      isMine
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-bl-md"
                    }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? "text-white/50" : "text-gray-400"}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-white/10 px-4 py-2.5 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); emitTyping(); }}
            placeholder="Type a message..."
            className="flex-1 bg-gray-50 dark:bg-white/[0.07] border border-gray-200 dark:border-white/10 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/50 focus:border-transparent transition dark:text-white dark:placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition disabled:opacity-50 flex-shrink-0"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <LuSend size={16} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
