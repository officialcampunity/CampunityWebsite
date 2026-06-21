"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { LuMessageCircle } from "react-icons/lu";
import { SkeletonCommentRow } from "./ui/Skeleton";

interface Comment {
  id: string;
  content: string;
  author: { id: string; displayName: string; username: string; avatarUrl: string | null };
  createdAt: string;
}

interface CommentSectionProps {
  resourceId: string;
}

export default function CommentSection({ resourceId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setComments([]);
    api.getComments(resourceId, 1, 20)
      .then((res) => {
        setComments(res.data as any);
        setTotal(res.total);
      })
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [resourceId]);

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const res = await api.getComments(resourceId, page + 1, 20);
      setComments((prev) => [...prev, ...res.data as any]);
      setPage((p) => p + 1);
    } catch (e) {
      console.error('Failed to load more comments:', e);
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const created = await api.addComment(resourceId, newComment.trim());
      setComments((prev) => [...prev, created]);
      setNewComment("");
      setTimeout(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      }, 100);
    } catch (e) {
      console.error('Failed to submit comment:', e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <h3 className="font-bold text-sm mb-4">
        Comments {comments.length > 0 && <span className="text-gray-400 font-normal">({comments.length})</span>}
      </h3>

      <div ref={listRef} className="space-y-4 max-h-80 overflow-y-auto mb-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <SkeletonCommentRow key={i} />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
              <LuMessageCircle size={20} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">No comments yet</p>
            <p className="text-xs text-gray-300 mt-1">Be the first to share your thoughts</p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 overflow-hidden">
                  {comment.author.avatarUrl ? (
                    <Image src={comment.author.avatarUrl} width={32} height={32} className="w-full h-full object-cover" alt={comment.author.displayName} />
                  ) : (
                    comment.author.displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 dark:bg-white/[0.07] rounded-2xl px-4 py-2.5">
                    <p className="text-xs font-bold mb-0.5 dark:text-white">{comment.author.displayName}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 ml-1">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {comments.length < total && (
              <div className="text-center pt-2">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="text-xs text-primary hover:underline font-medium disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load more comments"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-gray-50 dark:bg-white/[0.07] border border-gray-200 dark:border-white/10 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/50 focus:border-transparent transition dark:text-white dark:placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Send"
          )}
        </button>
      </form>
    </div>
  );
}
