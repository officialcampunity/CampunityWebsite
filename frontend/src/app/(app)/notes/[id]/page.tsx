"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth, AuthProvider } from "@/lib/auth-context";
import NoteDetail from "@/components/NoteDetail";
import type { Resource } from "@/lib/types";
import { LuCircleAlert } from "react-icons/lu";
import { SkeletonNoteDetail } from "@/components/ui/Skeleton";

function NoteDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [note, setNote] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const fetchNote = useCallback(async () => {
    const id = params.id as string;
    if (!id) return;
    setLoading(true);
    api
      .getResource(id)
      .then((r) => {
        setNote(r);
        setLikesCount(r.likesCount ?? 0);
        setIsLiked(r.isLiked ?? false);
      })
      .catch((err) => {
        if (err.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-start justify-center pt-8">
        <SkeletonNoteDetail />
      </div>
    );
  }

  if (notFound || !note) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
            <LuCircleAlert size={36} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Note not found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">This note might have been deleted or doesn&apos;t exist.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const noteForDetail = {
    id: note.id,
    title: note.title,
    description: note.description ?? "",
    fileType: note.fileType,
    fileUrl: note.cloudinaryUrl,
    author: {
      id: note.author.id,
      name: note.author.displayName,
      username: note.author.username,
      avatar: note.author.avatarUrl ?? "",
      bio: note.author.bio ?? undefined,
    },
    createdAt: note.createdAt,
    likesCount,
    commentsCount: note.comments?.length ?? 0,
    isLiked,
  };

  function handleLike() {
    setIsLiked((prev) => !prev);
    setLikesCount((c) => (isLiked ? c - 1 : c + 1));
  }

  return (
    <div className="max-w-2xl mx-auto py-4 md:py-8 px-4 pb-20 lg:pb-0">
      <NoteDetail
        note={noteForDetail}
        currentUserId={user?.id}
        onLike={handleLike}
        onBack={() => router.back()}
        onDelete={() => router.push("/dashboard")}
      />
    </div>
  );
}

export default function NoteDetailPage() {
  return (
    <AuthProvider>
      <NoteDetailContent />
    </AuthProvider>
  );
}
