"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import StoryViewer from "./StoryViewer";
import type { StoryUser } from "./StoryViewer";

interface StoryGroup {
  user: { id: string; displayName: string; username: string; avatarUrl: string | null };
  stories: { id: string; mediaUrl: string; mediaType: string; createdAt: string }[];
}

export default function StoriesBar() {
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

  const placeholders = loading && storyGroups.length === 0;

  return (
    <>
      <div className="mb-4">
        <h3 className="font-bold text-[22px] mb-4 tracking-tight dark:text-white">
          Stories
        </h3>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide px-1 py-2">
          {placeholders
            ? [1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                    <div className="w-full h-full rounded-full border-2 border-white dark:border-[#16161c] overflow-hidden">
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-2.5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                </div>
              ))
            : storyUsers.map((u, i) => (
                <button
                  key={u.id}
                  onClick={() => setViewerIndex(i)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16 group"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px] group-hover:scale-105 transition-transform duration-200">
                    <div className="w-full h-full rounded-full border-2 border-white dark:border-[#16161c] overflow-hidden">
                      {u.avatarUrl ? (
                        <Image
                          src={u.avatarUrl}
                          alt={u.displayName}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 text-sm font-bold">
                          {u.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 truncate w-full text-center">
                    {i === 0 && currentUser
                      ? "Your Story"
                      : u.displayName.split(" ")[0]}
                  </span>
                </button>
              ))}
        </div>
      </div>

      {viewerIndex !== null && (
        <StoryViewer
          users={storyUsers}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  );
}
