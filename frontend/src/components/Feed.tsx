"use client";

import { useState, useEffect, useCallback } from "react";
import NoteCard from "./NoteCard";
import { SkeletonFeedCard } from "./ui/Skeleton";
import { api } from "@/lib/api";
import { LuFileText, LuRefreshCw } from "react-icons/lu";
import type { Resource } from "@/lib/types";
import { resourceToFeedNote } from "@/lib/feed-utils";
import type { FeedNote } from "@/lib/feed-utils";

interface FeedProps {
  filter?: string;
  refreshKey?: number;
  hierarchy?: { universityId?: string; courseId?: string; semesterId?: string; subjectId?: string; authorId?: string };
}

export default function Feed({ filter, refreshKey, hierarchy }: FeedProps) {
  const [notes, setNotes] = useState<FeedNote[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set());

  async function handleLike(noteId: string) {
    if (likingIds.has(noteId)) return;
    setLikingIds((prev) => new Set(prev).add(noteId));
    try {
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;
      if (note.isLiked) {
        await api.unlikeResource(noteId);
        setNotes((prev) =>
          prev.map((n) =>
            n.id === noteId ? { ...n, isLiked: false, likesCount: Math.max(0, n.likesCount - 1) } : n
          )
        );
      } else {
        await api.likeResource(noteId);
        setNotes((prev) =>
          prev.map((n) =>
            n.id === noteId ? { ...n, isLiked: true, likesCount: n.likesCount + 1 } : n
          )
        );
      }
    } catch (e) {
      console.error('Failed to toggle like:', e);
    } finally {
      setLikingIds((prev) => {
        const next = new Set(prev);
        next.delete(noteId);
        return next;
      });
    }
  }

  const loadNotes = useCallback(async (pageNum: number, append: boolean) => {
    try {
      if (filter === "trending") {
        const res = await api.getTrending(pageNum, 10);
        const mapped = res.data.map(resourceToFeedNote);
        if (append) {
          setNotes((prev) => [...prev, ...mapped]);
        } else {
          setNotes(mapped);
        }
        setHasMore(pageNum * 10 < res.total);
      } else {
        const res = await api.getFeed(pageNum, 10, filter, hierarchy);
        const mapped = res.data.map(resourceToFeedNote);
        if (append) {
          setNotes((prev) => [...prev, ...mapped]);
        } else {
          setNotes(mapped);
        }
        setHasMore(pageNum * 10 < res.total);
      }
    } catch (e) {
      console.error('Failed to load feed:', e);
      if (!append) setNotes([]);
      setHasMore(false);
    }
  }, [filter, hierarchy]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setNotes([]);
    loadNotes(1, false).finally(() => setLoading(false));
  }, [loadNotes, refreshKey]);

  async function handleRefresh() {
    setRefreshing(true);
    setPage(1);
    await loadNotes(1, false);
    setRefreshing(false);
  }

  async function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    await loadNotes(nextPage, true);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ animationDelay: `${i * 150}ms`, animationFillMode: "backwards" }}>
            <SkeletonFeedCard />
          </div>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-3xl p-12 border border-gray-100 dark:border-white/10 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
          <LuFileText size={28} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-bold mb-1 dark:text-white">No notes yet</h3>
        <p className="text-sm text-gray-400 mb-6">Be the first to share your study notes with the community!</p>
        <button
          onClick={handleRefresh}
          className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition-all duration-300 ease-out active:scale-[0.97]"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold dark:text-white">
          {filter === "trending" ? "Trending Notes" : filter === "following" ? "From People You Follow" : "Latest Notes"}
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition disabled:opacity-50"
        >
          <LuRefreshCw size={20} className={`text-gray-500 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-4">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onLike={() => handleLike(note.id)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            className="px-8 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 text-sm font-bold rounded-full hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300 ease-out active:scale-[0.97] dark:text-white"
          >
            Load More
          </button>
        </div>
      )}

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
