"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import PostCommentSheet from "./PostCommentSheet";
import PostEditModal from "./PostEditModal";
import type { Post } from "@/lib/types";
import { LuHeart, LuMessageCircle, LuShare2, LuPencil, LuTrash2 } from "react-icons/lu";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface Props {
  post: Post;
  onDelete?: (id: string) => void;
  onUpdate?: (post: Post) => void;
}

export default function PostCard({ post, onDelete, onUpdate }: Props) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [liking, setLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);

  const isOwner = user?.id === currentPost.author.id;

  async function toggleLike() {
    if (!user || liking) return;
    setLiking(true);
    try {
      if (isLiked) {
        await api.unlikePost(currentPost.id);
        setIsLiked(false);
        setLikesCount((c) => Math.max(0, c - 1));
      } else {
        await api.likePost(currentPost.id);
        setIsLiked(true);
        setLikesCount((c) => c + 1);
      }
    } catch {
      addToast("Failed to update like", "error");
    } finally {
      setLiking(false);
    }
  }

  async function sharePost() {
    const url = `${window.location.origin}/dashboard`;
    try {
      await navigator.clipboard.writeText(url);
      addToast("Link copied to clipboard!", "success");
    } catch {
      addToast("Failed to copy link", "error");
    }
  }

  async function confirmDelete() {
    if (!onDelete) return;
    try {
      await api.deletePost(currentPost.id);
      addToast("Post deleted!", "success");
      onDelete(currentPost.id);
    } catch {
      addToast("Failed to delete post", "error");
    }
    setShowDeleteConfirm(false);
  }

  function handleUpdate(updated: Post) {
    setCurrentPost(updated);
    onUpdate?.(updated);
    addToast("Post updated!", "success");
    setShowEdit(false);
  }

  function onCommentAdded() {
    setCommentsCount((c) => c + 1);
  }

  return (
    <>
      <div className="bg-white dark:bg-dark-card rounded-[32px] p-4 sm:p-6 border border-gray-100 dark:border-white/10 transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/profile/${currentPost.author.id}`}
              className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
            >
              {currentPost.author.avatarUrl ? (
                <Image src={currentPost.author.avatarUrl} alt={currentPost.author.displayName} width={40} height={40} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white font-bold text-sm">
                  {currentPost.author.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <div>
              <Link
                href={`/profile/${currentPost.author.id}`}
                className="font-bold text-sm dark:text-white hover:underline"
              >
                {currentPost.author.displayName}
              </Link>
              <p className="text-xs text-gray-400">@{currentPost.author.username} · {timeAgo(currentPost.createdAt)}</p>
            </div>
          </div>
          {isOwner && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowEdit(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-primary transition"
              >
                <LuPencil size={14} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-red-500 transition"
              >
                <LuTrash2 size={14} />
              </button>
            </div>
          )}
        </div>

        <p className="text-[15px] text-gray-800 dark:text-white/80 leading-relaxed whitespace-pre-wrap mb-3">
          {currentPost.content}
        </p>

        {currentPost.imageUrl && (
          <div className="rounded-3xl overflow-hidden bg-gray-100 dark:bg-white/10 mb-3">
            <Image
              src={currentPost.imageUrl}
              width={600}
              height={400}
              className="w-full max-h-96 object-cover"
              alt="Post image"
            />
          </div>
        )}

        <div className="flex items-center justify-between text-gray-500 font-medium text-[13px] px-1 pt-3 border-t border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-6">
            <button
              onClick={toggleLike}
              disabled={liking}
              className={`flex items-center gap-1.5 transition-all duration-300 active:scale-90 ${isLiked ? "text-pink-500" : "hover:text-pink-500"}`}
            >
              <LuHeart size={18} fill={isLiked ? "currentColor" : "none"} />
              <span className={isLiked ? "text-pink-500 font-bold" : ""}>{likesCount}</span>
            </button>
            <button
              onClick={() => setShowComments(true)}
              className="flex items-center gap-1.5 hover:text-gray-800 dark:hover:text-white transition-all duration-300 active:scale-90"
            >
              <LuMessageCircle size={18} />
              <span>{commentsCount}</span>
            </button>
            <button
              onClick={sharePost}
              className="flex items-center gap-1.5 hover:text-gray-800 dark:hover:text-white transition-all duration-300 active:scale-90"
            >
              <LuShare2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {showComments && (
        <PostCommentSheet
          postId={currentPost.id}
          onClose={() => setShowComments(false)}
          onCommentAdded={onCommentAdded}
        />
      )}

      {showEdit && (
        <PostEditModal
          post={currentPost}
          onClose={() => setShowEdit(false)}
          onSuccess={handleUpdate}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-dark-card rounded-3xl p-6 animate-in fade-in zoom-in duration-300">
            <h3 className="text-lg font-bold dark:text-white mb-2 text-center">Delete post?</h3>
            <p className="text-sm text-gray-400 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-red-500 text-white hover:bg-red-600 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
