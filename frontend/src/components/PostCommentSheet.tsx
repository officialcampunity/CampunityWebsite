"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import type { PostComment } from "@/lib/types";
import { LuX, LuSend } from "react-icons/lu";

interface Props {
  postId: string;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export default function PostCommentSheet({ postId, onClose, onCommentAdded }: Props) {
  const { user } = useAuth();
  const { open: openAuth } = useAuthModal();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getPostComments(postId)
      .then((res) => setComments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    if (!user) { openAuth("login"); return; }
    setSending(true);
    try {
      const comment = await api.addPostComment(postId, text.trim());
      setComments((prev) => [comment, ...prev]);
      setText("");
      onCommentAdded?.();
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white dark:bg-dark-card rounded-t-3xl sm:rounded-3xl max-h-[70vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 dark:border-white/10 flex-shrink-0">
          <h3 className="font-bold dark:text-white">Comments</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 transition">
            <LuX size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No comments yet. Be the first!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Link href={`/profile/${c.author.id}`} className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  {c.author.avatarUrl ? (
                    <Image src={c.author.avatarUrl} alt="" width={32} height={32} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white text-xs font-bold">
                      {c.author.displayName.charAt(0)}
                    </div>
                  )}
                </Link>
                <div>
                  <Link href={`/profile/${c.author.id}`} className="font-bold text-sm dark:text-white hover:underline">
                    {c.author.displayName}
                  </Link>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSend} className="flex-shrink-0 flex items-center gap-2 px-5 py-3 border-t border-gray-100 dark:border-white/10">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-gray-100 dark:bg-white/10 rounded-full px-4 py-2 text-sm outline-none dark:text-white placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition flex-shrink-0"
          >
            <LuSend size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
