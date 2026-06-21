"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import NoteCard from "@/components/NoteCard";
import { api } from "@/lib/api";
import { SkeletonFeedCard } from "@/components/ui/Skeleton";
import { LuBookmark } from "react-icons/lu";
import { resourceToFeedNote } from "@/lib/feed-utils";

function BookmarksContent() {
  const { user, loading } = useAuth();
  const { open } = useAuthModal();
  const [notes, setNotes] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingNotes, setLoadingNotes] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoadingNotes(true);
    api.getBookmarked(1).then((res) => {
      setNotes(res.data.map(resourceToFeedNote));
      setTotal(res.total);
    }).catch((e) => console.error('Failed to load bookmarks:', e)).finally(() => setLoadingNotes(false));
  }, [user]);

  async function handleLoadMore() {
    const next = page + 1;
    try {
      const res = await api.getBookmarked(next);
      setNotes((prev) => [...prev, ...res.data.map(resourceToFeedNote)]);
      setPage(next);
    } catch (e) {
      console.error('Failed to load more bookmarks:', e);
    }
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
            <LuBookmark size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold mb-1 dark:text-white">Sign in to see your bookmarks</h3>
          <p className="text-sm text-gray-400 mb-4">Bookmark notes to save them for later.</p>
          <button onClick={() => open("login")} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 animate-fadeIn">
      <div className="mb-5">
        <h1 className="text-2xl font-bold dark:text-white mb-1">Bookmarks</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Notes you&apos;ve bookmarked for later
        </p>
      </div>

      {loadingNotes ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (<SkeletonFeedCard key={i} />))}
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/10 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
            <LuBookmark size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold mb-1 dark:text-white">No bookmarks yet</h3>
          <p className="text-sm text-gray-400 mb-4 max-w-sm mx-auto">
            Bookmark notes to save them for later.
          </p>
          <Link href="/explore" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition">
            Explore Notes
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note: any) => (
            <NoteCard key={note.id} note={note} onClick={() => window.location.href = `/notes/${note.id}`} />
          ))}
          {notes.length < total && (
            <div className="text-center">
              <button onClick={handleLoadMore} className="px-8 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 text-sm font-bold rounded-full hover:bg-gray-50 dark:hover:bg-white/10 transition dark:text-white">
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BookmarksPage() {
  return <BookmarksContent />;
}
