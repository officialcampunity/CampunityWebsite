"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { User } from "@/lib/types";

export default function SuggestedUsersBar() {
  const router = useRouter();
  const { user } = useAuth();
  const [suggested, setSuggested] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSuggestedUsers()
      .then((data) => setSuggested(data.filter((u: User) => u.id !== user?.id).slice(0, 5)))
      .catch((e) => console.error('Failed to load suggestions:', e))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleFollow(userId: string) {
    if (!user) return;
    try {
      await api.followUser(userId);
      setSuggested((prev) => prev.filter((u) => u.id !== userId));
    } catch (e) {
      console.error('Failed to follow user:', e);
    }
  }

  return (
    <div className="mb-6">
      <h3 className="font-bold text-lg mb-3 tracking-tight dark:text-white">Suggestions</h3>
      <div className="space-y-3">
        {loading
          ? [1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-24" />
                  <div className="h-2.5 bg-gray-100 dark:bg-white/5 rounded w-16" />
                </div>
                <div className="h-7 w-16 bg-gray-200 dark:bg-white/10 rounded-full" />
              </div>
            ))
          : suggested.length > 0
            ? suggested.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <button onClick={() => router.push(`/profile/${u.id}`)} className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    {u.avatarUrl ? (
                      <Image src={u.avatarUrl} width={40} height={40} className="w-full h-full object-cover" alt={u.displayName} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white font-bold text-xs">
                        {u.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm dark:text-white truncate">{u.displayName}</p>
                    <p className="text-xs text-gray-400">@{u.username}</p>
                  </div>
                  <button
                    onClick={() => handleFollow(u.id)}
                    className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary/90 transition-all duration-300 ease-out active:scale-[0.95] flex-shrink-0"
                  >
                    Follow
                  </button>
                </div>
              ))
            : !loading && (
                <p className="text-sm text-gray-400 text-center py-4">No suggestions yet</p>
              )}
      </div>
    </div>
  );
}
