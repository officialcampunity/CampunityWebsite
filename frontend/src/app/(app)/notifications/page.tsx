"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { useSocket } from "@/lib/socket-context";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  LuBell,
  LuHeart,
  LuMessageSquare,
  LuUserPlus,
  LuCheck,
  LuX,
  LuClock,
  LuExternalLink,
} from "react-icons/lu";
import type { Notification } from "@/lib/types";

const MESSAGES: Record<string, string> = {
  follow: "started following you",
  like: "liked your note",
  comment: "commented on your note",
  message: "sent you a message",
};

const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  follow: <LuUserPlus size={16} />,
  like: <LuHeart size={16} />,
  comment: <LuMessageSquare size={16} />,
  message: <LuMessageSquare size={16} />,
};

const TYPE_STYLES: Record<string, string> = {
  follow: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  like: "bg-red-50 dark:bg-red-500/10 text-accent",
  comment: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
  message: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

function relativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function groupByDate(notifications: Notification[]): [string, Notification[]][] {
  const groups: [string, Notification[]][] = [];
  const now = Date.now();

  const recent = notifications.filter((n) => {
    const diff = now - new Date(n.createdAt).getTime();
    return diff < 86400000;
  });
  if (recent.length) groups.push(["Today", recent]);

  const older = notifications.filter((n) => {
    const diff = now - new Date(n.createdAt).getTime();
    return diff >= 86400000 && diff < 259200000;
  });
  if (older.length) groups.push(["This Week", older]);

  const old = notifications.filter((n) => {
    const diff = now - new Date(n.createdAt).getTime();
    return diff >= 259200000;
  });
  if (old.length) groups.push(["Earlier", old]);

  return groups;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { open } = useAuthModal();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<Notification | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const { notificationSocket } = useSocket();
  const { addToast } = useToast();

  const filtered = activeTab === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  const grouped = groupByDate(filtered);

  useEffect(() => {
    if (user) {
      setPage(1);
      setNotifications([]);
      api.getNotifications(1).then((res) => {
        setNotifications(res.data);
        setTotal(res.total);
      }).catch((e) => console.error('Failed to load notifications:', e));
    } else {
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    if (!notificationSocket) return;
    const handleNotification = (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
      setTotal((prev) => prev + 1);
      const typeMsg = MESSAGES[notif.type] || notif.type;
      addToast(`${notif.actor.displayName} ${typeMsg}`, "info");
    };
    notificationSocket.on("notification", handleNotification);
    return () => { notificationSocket.off("notification", handleNotification); };
  }, [notificationSocket, addToast]);

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const res = await api.getNotifications(page + 1);
      setNotifications((prev) => [...prev, ...res.data]);
      setPage((p) => p + 1);
    } catch (e) {
      console.error('Failed to load more notifications:', e);
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleMarkAllRead() {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-4 animate-fadeIn">
        <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/10 p-12 text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
            <LuBell size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold mb-1 dark:text-white">Sign in to see notifications</h3>
          <p className="text-sm text-gray-400 mb-4">We&apos;ll let you know when something happens.</p>
          <button onClick={() => open("login")} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold dark:text-white mb-1">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Stay updated with what&apos;s happening
          </p>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all duration-200 active:scale-[0.97]"
          >
            <LuCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/10 rounded-2xl w-fit mb-6">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-white dark:bg-dark-card text-primary shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
              {tab.key === "unread" && notifications.some((n) => !n.read) && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-6">
          {grouped.map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-1">{dateLabel}</h3>
              <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/10 overflow-hidden divide-y divide-gray-100 dark:divide-white/10">
                {items.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={async () => {
                      setSelected(notif);
                      if (!notif.read) {
                        await api.markNotificationRead(notif.id);
                        setNotifications((prev) =>
                          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                        );
                      }
                    }}
                    className={`flex items-center gap-4 px-5 py-4 transition hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer ${
                      !notif.read ? "bg-primary/[0.02]" : ""
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_STYLES[notif.type] || "bg-gray-100 dark:bg-white/10 text-gray-500"}`}>
                      {NOTIFICATION_ICONS[notif.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0 overflow-hidden">
                          {notif.actor.avatarUrl ? (
                            <Image src={notif.actor.avatarUrl} width={20} height={20} className="w-full h-full object-cover" alt={notif.actor.displayName} />
                          ) : (
                            notif.actor.displayName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <p className="text-sm">
                          <span className="font-bold dark:text-white">{notif.actor.displayName}</span>{" "}
                          <span className="text-gray-500 dark:text-gray-400">{MESSAGES[notif.type] || notif.type}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">{relativeTime(notif.createdAt)}</span>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {notifications.length < total && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 text-sm font-bold rounded-full hover:bg-gray-50 dark:hover:bg-white/10 transition dark:text-white disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/10 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
            <LuBell size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold mb-1 dark:text-white">
            {activeTab === "unread" ? "All caught up!" : "No notifications yet"}
          </h3>
          <p className="text-sm text-gray-400">
            {activeTab === "unread"
              ? "You have no unread notifications."
              : "We&apos;ll let you know when something happens."}
          </p>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <div
            className="relative w-full max-w-md bg-white dark:bg-dark-card rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition z-10"
              >
                <LuX size={14} />
              </button>

              <div className="pt-10 pb-6 px-6 text-center border-b border-gray-100 dark:border-white/10">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${TYPE_STYLES[selected.type] || "bg-gray-100 dark:bg-white/10 text-gray-500"}`}>
                  <div className="scale-150">
                    {NOTIFICATION_ICONS[selected.type]}
                  </div>
                </div>
                <h3 className="text-lg font-bold dark:text-white mb-1">
                  {selected.type === "follow" && "New Follower"}
                  {selected.type === "like" && "New Like"}
                  {selected.type === "comment" && "New Comment"}
                  {selected.type === "message" && "New Message"}
                </h3>
                <p className="text-sm text-gray-400">{MESSAGES[selected.type]}</p>
              </div>

              <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                    {selected.actor.avatarUrl ? (
                      <Image src={selected.actor.avatarUrl} width={48} height={48} className="w-full h-full object-cover" alt={selected.actor.displayName} />
                    ) : (
                      selected.actor.displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-bold dark:text-white">{selected.actor.displayName}</p>
                    <p className="text-sm text-gray-400">@{selected.actor.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <LuClock size={14} />
                  <span>{relativeTime(selected.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Status:</span>
                  <span className={`flex items-center gap-1.5 font-medium ${selected.read ? "text-gray-400" : "text-primary"}`}>
                    <span className={`w-2 h-2 rounded-full ${selected.read ? "bg-gray-300" : "bg-primary"}`} />
                    {selected.read ? "Read" : "Unread"}
                  </span>
                </div>

                <button
                  onClick={() => { setSelected(null); router.push(`/profile/${selected.actor.id}`); }}
                  className="w-full py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition flex items-center justify-center gap-2"
                >
                  <LuExternalLink size={15} />
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
