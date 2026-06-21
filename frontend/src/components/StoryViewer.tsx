"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { useToast } from "@/lib/toast-context";
import { LuX, LuChevronLeft, LuChevronRight, LuPlay, LuEye, LuMessageCircle, LuSend, LuHeart } from "react-icons/lu";
import type { StoryComment } from "@/lib/types";

export interface StoryUser {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  stories: {
    id: string;
    url: string;
    type: "image" | "video";
    caption: string | null;
    views: number;
    viewed: boolean;
  }[];
}

const STORY_DURATION = 4000;

function ProgressBar({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div className="h-0.5 flex-1 rounded-full bg-white/30 overflow-hidden">
      <div className={`h-full rounded-full bg-white transition-all duration-100 ${done ? "w-full" : active ? "animate-progress" : "w-0"}`} />
    </div>
  );
}

export default function StoryViewer({
  users, initialIndex, onClose,
}: {
  users: StoryUser[];
  initialIndex: number;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { open: openAuth } = useAuthModal();
  const { addToast } = useToast();
  const [userIndex, setUserIndex] = useState(initialIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewedRef = useRef<Set<string>>(new Set());
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const commentsInputRef = useRef<HTMLInputElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);

  const currentUser = users[userIndex];
  const stories = currentUser?.stories || [];
  const content = stories[storyIndex];
  const isOwnStory = user?.id === currentUser?.id;

  useEffect(() => {
    if (content && !content.viewed && !viewedRef.current.has(content.id)) {
      viewedRef.current.add(content.id);
      api.viewStory(content.id).catch(() => {});
    }
  }, [content]);

  const startProgress = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= STORY_DURATION) {
        clearInterval(timerRef.current!);
        goNext();
      }
    }, 100);
  }, [userIndex, storyIndex]);

  useEffect(() => {
    if (!paused) startProgress();
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, userIndex, storyIndex, startProgress]);

  function goNext() {
    if (storyIndex < stories.length - 1) setStoryIndex((i) => i + 1);
    else if (userIndex < users.length - 1) { setUserIndex((i) => i + 1); setStoryIndex(0); }
    else onClose();
  }

  function goPrev() {
    if (storyIndex > 0) setStoryIndex((i) => i - 1);
    else if (userIndex > 0) { setUserIndex((i) => i - 1); setStoryIndex((users[userIndex - 1]?.stories || []).length - 1); }
  }

  function handleTap(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.25) goPrev();
    else if (x > rect.width * 0.75) goNext();
    else setPaused((p) => !p);
  }

  async function loadComments() {
    if (!content || !showComments) return;
    setCommentsLoading(true);
    try {
      const data = await api.getStoryComments(content.id);
      setComments(data);
    } catch { /* ignore */ }
    setCommentsLoading(false);
  }

  useEffect(() => {
    if (showComments) loadComments();
  }, [showComments, content?.id]);

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || sendingComment || !content) return;
    if (!user) { openAuth("login"); return; }
    setSendingComment(true);
    try {
      const comment = await api.addStoryComment(content.id, commentText.trim());
      setComments((prev) => [comment, ...prev]);
      setCommentText("");
      addToast("Comment added!", "success");
    } catch { addToast("Failed to add comment", "error"); }
    setSendingComment(false);
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || sendingReply || !content) return;
    if (!user) { openAuth("login"); return; }
    setSendingReply(true);
    try {
      await api.replyToStory(content.id, replyText.trim());
      setReplyText("");
      addToast("Reply sent as message!", "success");
    } catch { addToast("Failed to send reply", "error"); }
    setSendingReply(false);
  }

  const gradientColors = [
    "from-pink-500 via-purple-500 to-indigo-500",
    "from-amber-500 via-orange-500 to-red-500",
    "from-green-400 via-emerald-500 to-teal-500",
    "from-cyan-400 via-blue-500 to-indigo-600",
    "from-rose-400 via-pink-500 to-fuchsia-500",
    "from-yellow-400 via-amber-500 to-orange-500",
    "from-violet-400 via-purple-500 to-pink-500",
  ];
  const gradient = gradientColors[userIndex % gradientColors.length];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-[90vw] sm:w-[380px] aspect-[9/16] max-h-[75vh] rounded-2xl overflow-hidden cursor-pointer select-none shadow-2xl" onClick={handleTap}>
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

        {content?.url ? (
          <div className="absolute inset-0 flex items-center justify-center p-0 relative">
            {content.type === "image" ? (
              <Image src={content.url} alt="" fill className="object-cover" />
            ) : (
              <video src={content.url} className="w-full h-full object-cover" autoPlay muted playsInline />
            )}
            {content.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
                <p className="text-white text-sm font-medium">{content.caption}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden ring-4 ring-white/30 mb-3">
              {currentUser?.avatarUrl ? (
                <Image src={currentUser.avatarUrl} alt="" width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-white">{currentUser?.displayName?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <p className="text-white text-lg font-bold">{currentUser?.displayName}</p>
            <p className="text-white/60 text-sm mt-0.5">@{currentUser?.username}</p>
          </div>
        )}

        <div className="absolute top-0 left-0 right-0 p-3 pt-4">
          <div className="flex gap-1 mb-3">
            {stories.map((_, i) => (
              <ProgressBar key={i} active={i === storyIndex && !paused} done={i < storyIndex} />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-white/50 flex-shrink-0">
                {currentUser?.avatarUrl ? (
                  <Image src={currentUser.avatarUrl} alt="" width={28} height={28} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/30 flex items-center justify-center text-white text-[10px] font-bold">
                    {currentUser?.displayName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <p className="text-white text-sm font-bold leading-tight">{currentUser?.displayName}</p>
            </div>
            <div className="flex items-center gap-2">
              {content && (
                <>
                  <div className="flex items-center gap-1 text-white/60 text-xs">
                    <LuEye size={12} />
                    {content.views}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
                    className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition"
                  >
                    <LuMessageCircle size={12} className="text-white" />
                  </button>
                </>
              )}
              {paused && <LuPlay size={14} className="text-white/70" />}
              <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition">
                <LuX size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="absolute bottom-3 left-0 right-0 px-3">
          {!isOwnStory && content && !showComments && (
            <form
              onSubmit={(e) => { e.stopPropagation(); handleReply(e); }}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-2"
            >
              <input
                ref={replyInputRef}
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${currentUser?.displayName}...`}
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/50"
              />
              <button
                type="submit"
                disabled={!replyText.trim() || sendingReply}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center disabled:opacity-40 hover:bg-white/30 transition"
              >
                <LuSend size={11} className="text-white" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Comments sidebar */}
      {showComments && content && (
        <div
          className="absolute right-0 top-0 bottom-0 w-80 bg-black/80 backdrop-blur-md rounded-r-2xl flex flex-col animate-in slide-in-from-right-4 duration-300 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-white font-bold text-sm">Comments</h3>
            <button onClick={() => setShowComments(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
              <LuX size={12} className="text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {commentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-white/50 text-sm text-center py-8">No comments yet</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-white/20">
                    {c.author.avatarUrl ? (
                      <Image src={c.author.avatarUrl} alt="" width={24} height={24} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-[9px] font-bold">{c.author.displayName.charAt(0)}</div>
                    )}
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">{c.author.displayName}</p>
                    <p className="text-white/70 text-xs">{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-t border-white/10">
            <input
              ref={commentsInputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-white/10 rounded-full px-3 py-1.5 text-sm text-white outline-none placeholder-white/40"
            />
            <button type="submit" disabled={!commentText.trim() || sendingComment} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center disabled:opacity-40 hover:bg-white/30 transition">
              <LuSend size={11} className="text-white" />
            </button>
          </form>
        </div>
      )}

      <style jsx global>{`
        @keyframes progress {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-progress { animation: progress ${STORY_DURATION}ms linear forwards; }
      `}</style>
    </div>
  );
}
