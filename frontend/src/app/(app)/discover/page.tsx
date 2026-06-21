"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Feed from "@/components/Feed";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  LuUsers,
  LuTrendingUp,
  LuBookOpen,
  LuFileText,
  LuUserPlus,
} from "react-icons/lu";
import type { User } from "@/lib/types";

const STORY_GRADIENTS = [
  "from-purple-500 via-pink-500 to-orange-400",
  "from-blue-500 via-cyan-500 to-teal-400",
  "from-yellow-400 via-orange-500 to-red-500",
  "from-green-400 via-emerald-500 to-teal-500",
  "from-pink-400 via-rose-500 to-red-500",
  "from-indigo-400 via-purple-500 to-pink-400",
  "from-sky-400 via-blue-500 to-indigo-500",
];

export default function DiscoverPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [suggested, setSuggested] = useState<User[]>([]);
  const [storiesUsers, setStoriesUsers] = useState<User[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSuggestedUsers()
      .then((data) => {
        setStoriesUsers(data.slice(0, 7));
        setSuggested(data.filter((u: User) => u.id !== user?.id).slice(0, 5));
      })
      .catch(() => {})
      .finally(() => { setLoading(false); setLoadingStories(false); });
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
    <div className="py-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold dark:text-white mb-1">Discover</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Stories, trending notes, and people to follow
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-bold text-base dark:text-white">Stories</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {loadingStories
            ? [1, 2, 3, 4].map((i) => (
                <div key={i} className="w-[110px] h-[140px] rounded-2xl bg-gray-200 dark:bg-white/10 animate-pulse flex-shrink-0" />
              ))
            : storiesUsers.map((u, i) => (
                <button
                  key={u.id}
                  onClick={() => router.push(`/profile/${u.id}`)}
                  className="relative w-[110px] h-[140px] rounded-2xl overflow-hidden shadow-sm group cursor-pointer transition-all duration-300 ease-out hover:shadow-md hover:scale-[1.02] active:scale-[0.98] flex-shrink-0"
                >
                  <div className={`w-full h-full bg-gradient-to-br ${STORY_GRADIENTS[i % STORY_GRADIENTS.length]}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center gap-1 bg-white dark:bg-dark-card rounded-full p-0.5 pr-1.5 shadow-sm">
                    {u.avatarUrl ? (
                      <Image src={u.avatarUrl} width={20} height={20} className="w-5 h-5 rounded-full object-cover" alt={u.displayName} />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-accent/60 to-accent flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">
                        {u.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p className="text-[10px] font-bold text-black dark:text-white truncate">{u.displayName}</p>
                  </div>
                </button>
              ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <LuTrendingUp size={16} className="text-primary" />
              <h2 className="font-bold text-base dark:text-white">Trending Notes</h2>
            </div>
            <Feed filter="trending" />
          </div>
        </div>

        <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0">
          <div className="lg:sticky lg:top-4 space-y-5">
            <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <LuUserPlus size={16} className="text-primary" />
                <h2 className="font-bold text-base dark:text-white">Suggestions</h2>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-24" />
                        <div className="h-2.5 bg-gray-100 dark:bg-white/5 rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : suggested.length > 0 ? (
                <div className="space-y-3">
                  {suggested.map((u) => (
                    <div key={u.id} className="flex items-center gap-3">
                      <button
                        onClick={() => router.push(`/profile/${u.id}`)}
                        className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                      >
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
                        className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary/90 transition-all duration-300 ease-out active:scale-[0.95] flex-shrink-0"
                      >
                        Follow
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => router.push("/search")}
                    className="w-full mt-1 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition"
                  >
                    Browse all users
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">No suggestions yet</p>
              )}
            </div>

            <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <LuBookOpen size={16} className="text-primary" />
                <h2 className="font-bold text-base dark:text-white">Quick Browse</h2>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/explore")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition text-left"
                >
                  <LuFileText size={16} className="text-gray-400" />
                  Browse by subject
                </button>
                <button
                  onClick={() => router.push("/search?tab=users")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition text-left"
                >
                  <LuUsers size={16} className="text-gray-400" />
                  Find classmates
                </button>
                <button
                  onClick={() => router.push("/search?tab=courses")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition text-left"
                >
                  <LuTrendingUp size={16} className="text-gray-400" />
                  Explore courses
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
