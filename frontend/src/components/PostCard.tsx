"use client";

import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/types";
import { LuTrash2 } from "react-icons/lu";

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
}

export default function PostCard({ post, onDelete }: Props) {
  return (
    <div className="bg-white dark:bg-dark-card rounded-[32px] p-4 sm:p-6 border border-gray-100 dark:border-white/10 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/profile/${post.author.id}`}
            className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
          >
            {post.author.avatarUrl ? (
              <Image src={post.author.avatarUrl} alt={post.author.displayName} width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white font-bold text-sm">
                {post.author.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div>
            <Link
              href={`/profile/${post.author.id}`}
              className="font-bold text-sm dark:text-white hover:underline"
            >
              {post.author.displayName}
            </Link>
            <p className="text-xs text-gray-400">@{post.author.username} · {timeAgo(post.createdAt)}</p>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-red-500 transition"
          >
            <LuTrash2 size={14} />
          </button>
        )}
      </div>

      <p className="text-[15px] text-gray-800 dark:text-white/80 leading-relaxed whitespace-pre-wrap mb-3">
        {post.content}
      </p>

      {post.imageUrl && (
        <div className="rounded-3xl overflow-hidden bg-gray-100 dark:bg-white/10">
          <Image
            src={post.imageUrl}
            width={600}
            height={400}
            className="w-full max-h-96 object-cover"
            alt="Post image"
          />
        </div>
      )}
    </div>
  );
}
