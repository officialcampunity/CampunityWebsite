"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { useSocket } from "@/lib/socket-context";
import { SkeletonConversationItem } from "./ui/Skeleton";

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: number;
}

interface ConversationListProps {
  onSelectConversation?: (conversationId: string, user?: { id: string; name: string; username: string; avatar: string }) => void;
  selectedId?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
  return new Date(dateStr).toLocaleDateString();
}

export default function ConversationList({ onSelectConversation, selectedId }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { chatSocket } = useSocket();

  useEffect(() => {
    setLoading(true);
    api.getConversations()
      .then((data: any) => {
        const mapped: Conversation[] = (data || []).map((item: any) => ({
          id: item.id,
          user: {
            id: item.user?.id || item.id,
            name: item.user?.name || item.user?.displayName || 'Unknown',
            username: item.user?.username || '',
            avatar: item.user?.avatar || item.user?.avatarUrl || '',
          },
          lastMessage: {
            content: item.lastMessage?.content || '',
            createdAt: item.lastMessage?.createdAt || new Date().toISOString(),
            isRead: item.lastMessage?.isRead ?? true,
          },
          unreadCount: item.unreadCount || 0,
        }));
        setConversations(mapped);
      })
      .catch((e) => {
        console.error('Failed to load conversations:', e);
        setConversations([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!chatSocket) return;

    const handleUserOnline = (userId: string) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    };
    const handleUserOffline = (userId: string) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };
    const handleNewMessage = (msg: any) => {
      api.getConversations().then((data: any) => {
        const mapped: Conversation[] = (data || []).map((item: any) => ({
          id: item.id,
          user: {
            id: item.user?.id || item.id,
            name: item.user?.name || item.user?.displayName || 'Unknown',
            username: item.user?.username || '',
            avatar: item.user?.avatar || item.user?.avatarUrl || '',
          },
          lastMessage: {
            content: item.lastMessage?.content || '',
            createdAt: item.lastMessage?.createdAt || new Date().toISOString(),
            isRead: item.lastMessage?.isRead ?? true,
          },
          unreadCount: item.unreadCount || 0,
        }));
        setConversations(mapped);
      }).catch(() => {});
    };

    const handleUnreadUpdate = (data: { count: number }) => {
      setConversations((prev) => prev.map((c) => ({ ...c, unreadCount: data.count })));
    };

    chatSocket.on("userOnline", handleUserOnline);
    chatSocket.on("userOffline", handleUserOffline);
    chatSocket.on("newMessage", handleNewMessage);
    chatSocket.on("unreadUpdate", handleUnreadUpdate);

    return () => {
      chatSocket.off("userOnline", handleUserOnline);
      chatSocket.off("userOffline", handleUserOffline);
      chatSocket.off("newMessage", handleNewMessage);
      chatSocket.off("unreadUpdate", handleUnreadUpdate);
    };
  }, [chatSocket]);

  const filtered = conversations.filter((c) =>
    c.user.name.toLowerCase().includes(search.toLowerCase()) ||
    c.user.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="relative mb-4">
        <svg
          className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="w-full bg-gray-50 dark:bg-white/[0.07] border border-gray-200 dark:border-white/10 rounded-full py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/50 transition dark:text-white dark:placeholder-gray-500"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonConversationItem key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">
            {search ? "No conversations found" : "No conversations yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation?.(conv.id, conv.user)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-left ${
                selectedId === conv.id
                  ? "bg-gray-100 dark:bg-white/10"
                  : "hover:bg-gray-50 dark:hover:bg-white/[0.04]"
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                  {conv.user.avatar ? (
                    <Image src={conv.user.avatar} alt={conv.user.name} width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    conv.user.name.charAt(0).toUpperCase()
                  )}
                </div>
                {onlineUsers.has(conv.user.id) && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-dark-card" />
                )}
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate dark:text-white ${conv.unreadCount > 0 ? "font-bold" : "font-medium"}`}>
                    {conv.user.name}
                  </p>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                    {timeAgo(conv.lastMessage.createdAt)}
                  </span>
                </div>
                <p className={`text-xs truncate ${
                  conv.unreadCount > 0 ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-400"
                }`}>
                  {conv.lastMessage.content}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
