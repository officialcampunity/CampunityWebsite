"use client";

import { useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";

interface User {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  bio?: string;
  isFollowing?: boolean;
}

interface UserCardProps {
  user: User;
  compact?: boolean;
  onClick?: () => void;
  onFollow?: (userId: string, following: boolean) => void;
}

export default function UserCard({ user, compact, onClick, onFollow }: UserCardProps) {
  const [following, setFollowing] = useState(user.isFollowing ?? false);
  const [loading, setLoading] = useState(false);

  async function handleFollow(e: React.MouseEvent) {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      if (following) {
        await api.unfollowUser(user.id);
      } else {
        await api.followUser(user.id);
      }
      setFollowing(!following);
      onFollow?.(user.id, !following);
    } catch (e) {
      console.error('Failed to toggle follow:', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 cursor-pointer group transition-all duration-300 ease-out ${
        compact ? "p-2 hover:bg-gray-50 dark:hover:bg-white/10 rounded-xl" : "p-3 hover:bg-gray-50 dark:hover:bg-white/10 rounded-2xl"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
        {user.avatarUrl ? (
          <Image src={user.avatarUrl} alt={user.displayName} width={40} height={40} className="w-full h-full object-cover" />
        ) : (
          user.displayName.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold truncate dark:text-white ${compact ? "text-sm" : "text-sm"}`}>{user.displayName}</p>
        <p className="text-xs text-gray-400 truncate">@{user.username}</p>
        {!compact && user.bio && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{user.bio}</p>
        )}
      </div>
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300 ease-out active:scale-95 flex-shrink-0 ${
          following
            ? "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600"
            : "bg-primary text-white hover:bg-primary/90"
        } disabled:opacity-50`}
      >
        {loading ? (
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
        ) : following ? (
          "Following"
        ) : (
          "Follow"
        )}
      </button>
    </div>
  );
}
