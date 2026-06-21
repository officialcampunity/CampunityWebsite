"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import Feed from "@/components/Feed";
import type { User } from "@/lib/types";
import { LuCircleAlert } from "react-icons/lu";

function ProfileContent() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { open } = useAuthModal();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const isOwnProfile = currentUser?.id === params.id;

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;

    api
      .getUser(id)
      .then((data) => {
        setProfile(data);
        if ((data as any).isFollowing !== undefined) {
          setIsFollowing((data as any).isFollowing);
        }
        if ((data as any).isBlocked !== undefined) {
          setIsBlocked((data as any).isBlocked);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    setRefreshKey((k) => k + 1);
  }, [params.id]);

  async function handleFollow() {
    if (!currentUser) {
      open("login");
      return;
    }
    if (isFollowing) {
      setShowUnfollowModal(true);
      return;
    }
    setFollowLoading(true);
    try {
      await api.followUser(profile!.id);
      setIsFollowing(true);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              _count: {
                ...prev._count!,
                followers: prev._count!.followers + 1,
              },
            }
          : prev
      );
    } catch (e) {
      console.error('Failed to follow:', e);
    } finally {
      setFollowLoading(false);
    }
  }

  async function confirmUnfollow() {
    setFollowLoading(true);
    try {
      await api.unfollowUser(profile!.id);
      setIsFollowing(false);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              _count: {
                ...prev._count!,
                followers: prev._count!.followers - 1,
              },
            }
          : prev
      );
    } catch (e) {
      console.error('Failed to unfollow:', e);
    } finally {
      setFollowLoading(false);
      setShowUnfollowModal(false);
    }
  }

  async function handleBlock() {
    if (!currentUser) {
      open("login");
      return;
    }
    setBlocking(true);
    try {
      await api.blockUser(profile!.id);
      setIsBlocked(true);
      setIsFollowing(false);
    } catch (e) {
      console.error("Failed to block user:", e);
    } finally {
      setBlocking(false);
    }
  }

  async function handleUnblock() {
    setBlocking(true);
    try {
      await api.unblockUser(profile!.id);
      setIsBlocked(false);
    } catch (e) {
      console.error("Failed to unblock user:", e);
    } finally {
      setBlocking(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-20 lg:pb-0 animate-pulse">
        <div className="h-24 md:h-48 bg-gray-200 dark:bg-white/5" />
        <div className="max-w-4xl mx-auto px-4 -mt-10 md:-mt-20">
          <div className="bg-white dark:bg-dark-card rounded-2xl md:rounded-3xl border border-gray-100 dark:border-white/10 p-4 md:p-8 mb-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-gray-200 dark:bg-white/10 border-4 border-white mb-3 md:mb-4" />
              <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-48 mb-1" />
              <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-32 mb-4" />
              <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-64 mb-6" />
              <div className="flex gap-4 md:gap-8 mb-6 flex-wrap justify-center">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div className="h-6 bg-gray-200 dark:bg-white/10 rounded w-12 mb-1 mx-auto" />
                    <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-16 mx-auto" />
                  </div>
                ))}
              </div>
              <div className="h-10 bg-gray-200 dark:bg-white/10 rounded-full w-32" />
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-dark-card rounded-2xl md:rounded-3xl border border-gray-100 dark:border-white/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-32" />
                    <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-24" />
                  </div>
                  <div className="w-20 h-8 bg-gray-100 dark:bg-white/5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
            <LuCircleAlert size={36} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 dark:text-white">User not found</h2>
          <p className="text-gray-500 mb-6">This user doesn&apos;t exist or has been removed.</p>
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-20 lg:pb-0">
      <div className="h-24 md:h-48 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />

      <div className="max-w-4xl mx-auto px-4 -mt-10 md:-mt-20">
        <div className="bg-white dark:bg-dark-card rounded-2xl md:rounded-3xl border border-gray-100 dark:border-white/10 p-4 md:p-8 mb-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white text-2xl md:text-4xl font-bold border-4 border-white mb-3 md:mb-4 overflow-hidden">
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt={profile.displayName} width={128} height={128} className="w-full h-full object-cover" />
              ) : (
                profile.displayName.charAt(0).toUpperCase()
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-bold dark:text-white">{profile.displayName}</h1>
            <p className="text-gray-400 mb-1">@{profile.username}</p>

            {profile.bio && <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">{profile.bio}</p>}

            <div className="flex gap-4 md:gap-8 mb-6 flex-wrap justify-center">
              <div className="text-center">
                <p className="text-lg md:text-xl font-bold dark:text-white">{profile._count?.resources ?? 0}</p>
                <p className="text-xs text-gray-400">Notes</p>
              </div>
              <div className="text-center">
                <p className="text-lg md:text-xl font-bold dark:text-white">{profile._count?.followers ?? 0}</p>
                <p className="text-xs text-gray-400">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-lg md:text-xl font-bold dark:text-white">{profile._count?.following ?? 0}</p>
                <p className="text-xs text-gray-400">Following</p>
              </div>
            </div>

            {isOwnProfile ? (
              <button
                onClick={() => router.push("/settings")}
                className="px-6 py-2.5 border border-gray-300 dark:border-white/20 text-sm font-bold rounded-full hover:bg-gray-50 dark:hover:bg-white/10 dark:text-white transition"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {isBlocked ? (
                  <button
                    onClick={handleUnblock}
                    disabled={blocking}
                    className="px-6 py-2.5 bg-red-500 text-white text-sm font-bold rounded-full transition disabled:opacity-50 hover:bg-red-600"
                  >
                    {blocking ? "Unblocking..." : "Unblock"}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`px-6 py-2.5 text-sm font-bold rounded-full transition disabled:opacity-50 ${
                        isFollowing
                          ? "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 border border-gray-200 dark:border-white/10"
                          : "bg-primary text-white hover:bg-primary/90"
                      }`}
                    >
                      {followLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {isFollowing ? "Unfollowing..." : "Following..."}
                        </span>
                      ) : isFollowing ? (
                        "Following"
                      ) : (
                        "Follow"
                      )}
                    </button>
                    <button
                      onClick={handleBlock}
                      disabled={blocking}
                      className="px-4 py-2.5 text-xs font-semibold text-gray-400 border border-gray-300 dark:border-white/10 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-gray-300 transition disabled:opacity-50"
                    >
                      {blocking ? "Blocking..." : "Block"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 dark:text-white">Notes by {profile.displayName}</h2>
          <Feed refreshKey={refreshKey} hierarchy={{ authorId: profile.id }} />
        </div>
      </div>

      {showUnfollowModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Unfollow confirmation">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !followLoading && setShowUnfollowModal(false)} aria-label="Close modal" />
          <div className="relative w-full max-w-sm bg-white dark:bg-dark-card rounded-3xl p-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </div>
              <h3 className="text-lg font-bold dark:text-white mb-2">Unfollow @{profile.username}?</h3>
              <p className="text-sm text-gray-400">Are you sure you want to unfollow this user?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowUnfollowModal(false)} disabled={followLoading} className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition disabled:opacity-50" aria-label="Cancel unfollow">Cancel</button>
              <button onClick={confirmUnfollow} disabled={followLoading} className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2" aria-label="Confirm unfollow">
                {followLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Unfollow"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return <ProfileContent />;
}
