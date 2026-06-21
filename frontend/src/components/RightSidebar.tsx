"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { User } from "@/lib/types";
import StoryViewer, { type StoryUser } from "./StoryViewer";
import { LuEye, LuPlus } from "react-icons/lu";

interface ApiStoryGroup {
  user: { id: string; displayName: string; username: string; avatarUrl: string | null };
  stories: { id: string; mediaUrl: string; mediaType: string; caption: string | null; views: number; viewed: boolean }[];
}

interface ApiDiscoverStory {
  id: string;
  mediaUrl: string;
  mediaType: string;
  caption: string | null;
  createdAt: string;
  views: number;
  viewed: boolean;
  author: { id: string; displayName: string; username: string; avatarUrl: string | null };
}

function FollowingStories() {
  const { user: currentUser } = useAuth();
  const [storyGroups, setStoryGroups] = useState<ApiStoryGroup[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    api.getStories().then(setStoryGroups).catch(() => {});
  }, []);

  const storyUsers: StoryUser[] = storyGroups.map((g) => ({
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
  }));

  if (storyGroups.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Stories</h3>
        <Link
          href="/stories/new"
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <LuPlus size={12} />
          Add
        </Link>
      </div>
      <div className="space-y-2">
        {storyUsers.map((u, i) => {
          const hasUnviewed = u.stories.some(s => !s.viewed);
          return (
            <button
              key={u.id}
              onClick={() => setViewerIndex(i)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition text-left group"
            >
              <div
                className={`w-11 h-14 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br ${
                  hasUnviewed
                    ? "from-pink-400 via-purple-400 to-indigo-400 p-[2px]"
                    : "from-gray-300 to-gray-300 dark:from-gray-600 dark:to-gray-600 p-[2px]"
                }`}
              >
                <div className="w-full h-full rounded-[10px] overflow-hidden bg-white dark:bg-dark-bg">
                  {u.avatarUrl ? (
                    <Image
                      src={u.avatarUrl}
                      alt={u.displayName}
                      width={44}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                      {u.displayName.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold dark:text-white truncate">{u.displayName}</p>
                <p className="text-xs text-gray-400 truncate">
                  {u.stories.length} story{u.stories.length !== 1 ? "ies" : "y"}
                  {u.stories.some(s => s.views > 0) && (
                    <span className="ml-2 inline-flex items-center gap-0.5">
                      <LuEye size={10} />
                      {u.stories.reduce((a, s) => a + s.views, 0)}
                    </span>
                  )}
                </p>
              </div>
            </button>
          );
        })}
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

function DiscoverStories() {
  const [stories, setStories] = useState<ApiDiscoverStory[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    api.getDiscoverStories().then(setStories).catch(() => {});
  }, []);

  if (stories.length === 0) return null;

  const sorted = [...stories].sort((a, b) => b.views - a.views);
  const top = sorted.slice(0, 5);

  const storyUsers: StoryUser[] = [
    {
      id: "discover",
      displayName: "Trending",
      username: "",
      avatarUrl: null,
      stories: top.map((s) => ({
        id: s.id,
        url: s.mediaUrl,
        type: (s.mediaType === "video" ? "video" : "image") as "image" | "video",
        caption: s.caption,
        views: s.views,
        viewed: s.viewed,
      })),
    },
    ...top.map((s) => ({
      id: s.author.id,
      displayName: s.author.displayName,
      username: s.author.username,
      avatarUrl: s.author.avatarUrl,
      stories: [{
        id: s.id,
        url: s.mediaUrl,
        type: (s.mediaType === "video" ? "video" : "image") as "image" | "video",
        caption: s.caption,
        views: s.views,
        viewed: s.viewed,
      }],
    })),
  ];

  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Trending Stories</h3>
      <div className="space-y-2">
        {top.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setViewerIndex(i + 1)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition text-left group"
          >
            <div className="w-11 h-14 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
              {s.mediaUrl ? (
                <Image
                  src={s.mediaUrl}
                  alt=""
                  width={44}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg">
                  {s.mediaType === "image" ? "🖼" : "🎬"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold dark:text-white truncate">{s.author.displayName}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <LuEye size={10} />
                {s.views} view{s.views !== 1 ? "s" : ""}
              </p>
            </div>
          </button>
        ))}
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
  const { user: currentUser } = useAuth();
  const [suggested, setSuggested] = useState<User[]>([]);

  useEffect(() => {
    api.getSuggestedUsers().then(setSuggested).catch(() => {});
  }, []);

  if (suggested.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Suggested</h3>
      <div className="space-y-2">
        {suggested.map((u) => (
          <Link
            key={u.id}
            href={`/profile/${u.id}`}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition group"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary/40 to-primary flex-shrink-0">
              {u.avatarUrl ? (
                <Image src={u.avatarUrl} alt={u.displayName} width={32} height={32} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                  {u.displayName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold dark:text-white truncate">{u.displayName}</p>
              <p className="text-[11px] text-gray-400 truncate">@{u.username}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function RightSidebar() {
  return (
    <div className="p-3">
      <FollowingStories />
      <DiscoverStories />
      <SuggestedUsers />
    </div>
  );
}
