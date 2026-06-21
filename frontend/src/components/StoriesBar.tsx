"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import StoryViewer, { type StoryUser } from "./StoryViewer";

interface ApiStoryGroup {
  user: { id: string; displayName: string; username: string; avatarUrl: string | null };
  stories: { id: string; mediaUrl: string; mediaType: string; caption: string | null; views: number; viewed: boolean }[];
}

export default function StoriesBar() {
  const { user: currentUser } = useAuth();
  const [storyGroups, setStoryGroups] = useState<ApiStoryGroup[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    api.getStories().then(setStoryGroups).catch(() => {});
  }, []);

  const storyUsers: StoryUser[] = [
    ...(currentUser
      ? [{
          id: currentUser.id,
          displayName: "Your Story",
          username: currentUser.displayName || currentUser.email || "",
          avatarUrl: currentUser.avatarUrl || null,
          stories: [{ id: "own", url: currentUser.avatarUrl || "", type: "image" as const, caption: null, views: 0, viewed: true }],
        }]
      : []),
    ...storyGroups.map((g) => ({
      id: g.user.id,
      displayName: g.user.displayName,
      username: g.user.username,
      avatarUrl: g.user.avatarUrl,
      stories: g.stories.map((s) => ({
        id: s.id,
        url: s.mediaUrl,
        type: (s.mediaType === "video" ? "video" : "image") as "image" | "video",
        caption: s.caption,
        views: s.views,
        viewed: s.viewed,
      })),
    })),
  ];

  if (storyGroups.length === 0) return null;

  const Skeleton = () => (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
          <div className="w-12 h-3 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="mb-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-2">
          {storyUsers.map((u, i) => {
            const allViewed = u.stories.every((s) => s.viewed);
            const hasUnviewed = u.stories.some((s) => !s.viewed);
            return (
              <button
                key={u.id}
                onClick={() => {
                  if (u.id === "own") return;
                  setViewerIndex(i);
                }}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center p-[3px] transition ${
                    hasUnviewed
                      ? "bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-dark-bg">
                    {u.avatarUrl ? (
                      <Image
                        src={u.avatarUrl}
                        alt={u.displayName}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">
                        {u.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <span className={`text-[11px] font-medium truncate max-w-[68px] text-center ${
                  u.id === "own" ? "text-primary" : "dark:text-white text-gray-700"
                }`}>
                  {u.id === "own" ? "Your Story" : u.displayName.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {viewerIndex !== null && (
        <StoryViewer
          users={storyUsers}
          initialIndex={Math.max(0, viewerIndex - (currentUser ? 1 : 0))}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  );
}
