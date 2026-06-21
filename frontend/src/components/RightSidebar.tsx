"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import StoryViewer from "./StoryViewer";
import type { StoryUser } from "./StoryViewer";
import type { User } from "@/lib/types";

export default function RightSidebar() {
  return (
    <aside className="w-full h-full flex flex-col overflow-y-auto pb-8 pr-2">
      <Stories />
      <SuggestedUsers />
    </aside>
  );
}

interface StoryGroup {
  user: { id: string; displayName: string; username: string; avatarUrl: string | null };
  stories: { id: string; mediaUrl: string; mediaType: string; createdAt: string }[];
}

function Stories() {
  const { user: currentUser } = useAuth();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    api.getStories()
      .then((data) => setStoryGroups(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const storyUsers: StoryUser[] = [
    ...(currentUser
      ? [{
          id: currentUser.id,
          displayName: currentUser.displayName,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
          stories: [{ id: "own", url: currentUser.avatarUrl || "", type: "image" as const }],
        } as StoryUser]
      : []),
    ...storyGroups.map((g) => ({
      id: g.user.id,
      displayName: g.user.displayName,
      username: g.user.username,
      avatarUrl: g.user.avatarUrl,
      stories: g.stories.map((s) => ({ id: s.id, url: s.mediaUrl, type: s.mediaType as "image" | "video" })),
    })),
  ];

  if (loading) {
    return (
      <div className="mb-10">
        <h3 className="font-bold text-[22px] mb-4 tracking-tight dark:text-white">Stories</h3>
        <div className="flex gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="w-[130px] h-[180px] rounded-3xl bg-gray-200 dark:bg-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h3 className="font-bold text-[22px] mb-4 tracking-tight dark:text-white">Stories</h3>
      <div className="flex gap-4">
        {storyUsers.length > 0 ? storyUsers.map((u, i) => (
          <button
            key={u.id}
            onClick={() => setViewerIndex(i)}
            className="relative w-[130px] h-[180px] rounded-3xl overflow-hidden shadow-sm group cursor-pointer transition-all duration-300 ease-out hover:shadow-md hover:scale-[1.02] active:scale-[0.98] flex-shrink-0"
          >
            <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5 bg-white dark:bg-dark-card rounded-full p-1 pr-2 shadow-sm">
              {u.avatarUrl ? (
                <Image src={u.avatarUrl} width={20} height={20} className="w-5 h-5 rounded-full object-cover" alt={u.displayName} />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">
                  {u.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <p className="text-[10px] font-bold text-black dark:text-white truncate">{u.displayName}</p>
            </div>
          </button>
        )) : (
          <div className="text-sm text-gray-400 py-8 text-center w-full">No stories yet</div>
        )}
      </div>

      {viewerIndex !== null && (
        <StoryViewer
          users={storyUsers}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </div>
  );
}

function SuggestedUsers() {
  const router = useRouter();
  const { user } = useAuth();
  const [suggested, setSuggested] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSuggestedUsers()
      .then(setSuggested)
      .catch(() => setSuggested([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleFollow(userId: string) {
    if (!user) return;
    try {
      await api.followUser(userId);
      setSuggested((prev) => prev.filter((u) => u.id !== userId));
    } catch {}
  }

  if (loading) return <div className="mb-10"><div className="h-6 bg-gray-200 dark:bg-white/10 rounded w-32 mb-4 animate-pulse" /></div>;

  if (suggested.length === 0) {
    return (
      <div className="mb-10">
        <h3 className="font-bold text-[22px] mb-4 tracking-tight dark:text-white">Suggestions</h3>
        <div className="text-sm text-gray-400 text-center py-8 bg-gray-50 dark:bg-white/5 rounded-3xl">
          No suggestions yet
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10 relative">
      <h3 className="font-bold text-[22px] mb-4 tracking-tight dark:text-white">Suggestions</h3>

      <div className="space-y-4">
        {suggested.filter((u) => u.id !== user?.id).map((u) => (
          <div key={u.id} className="flex items-center gap-4">
            <button onClick={() => router.push(`/profile/${u.id}`)} className="w-[46px] h-[46px] rounded-full overflow-hidden flex-shrink-0">
              {u.avatarUrl ? (
                <Image src={u.avatarUrl} width={46} height={46} className="w-full h-full object-cover" alt={u.displayName} />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white font-bold text-sm">
                  {u.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[15px] leading-tight text-gray-900 dark:text-white truncate">{u.displayName}</p>
              <p className="text-[13px] text-gray-500 leading-tight">@{u.username}</p>
            </div>
            <button
              onClick={() => handleFollow(u.id)}
              className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary/90 transition-all duration-300 ease-out active:scale-[0.95]"
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
