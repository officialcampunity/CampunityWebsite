"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import UserCard from "@/components/UserCard";
import type { User } from "@/lib/types";
import { LuCircleAlert, LuArrowLeft, LuUsers } from "react-icons/lu";

function FollowersContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;

    setPage(1);
    setFollowers([]);
    Promise.all([
      api.getUser(id).catch(() => null),
      api.getFollowers(id, 1, 20),
    ])
      .then(([profileData, followersRes]) => {
        setProfile(profileData);
        setFollowers(followersRes.data);
        setTotal(followersRes.total);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const res = await api.getFollowers(params.id as string, page + 1, 20);
      setFollowers((prev) => [...prev, ...res.data]);
      setPage((p) => p + 1);
    } catch {
      /* ignore */
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-20 lg:pb-0 animate-pulse">
        <div className="max-w-2xl mx-auto px-4 pt-4 md:pt-24">
          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24 mb-6 md:mb-8" />
          <div className="h-6 bg-gray-200 dark:bg-white/10 rounded w-48 mb-4 md:mb-6" />
          <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/10">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24" />
                  <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-16" />
                </div>
                <div className="w-20 h-7 bg-gray-100 dark:bg-white/5 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
            <LuCircleAlert size={36} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">Could not load followers.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-20 lg:pb-0">
      <div className="max-w-2xl mx-auto px-4 pt-4 md:pt-24">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black dark:hover:text-white transition mb-6 md:mb-8"
        >
          <LuArrowLeft size={18} />
          Back to Profile
        </button>

        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 dark:text-white">
          {profile ? `Followers (${profile._count?.followers ?? 0})` : "Followers"}
        </h1>

        {followers.length > 0 ? (
          <div>
            <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/10">
              {followers.map((follower) => (
                <UserCard
                  key={follower.id}
                  user={{
                    id: follower.id,
                    displayName: follower.displayName,
                    username: follower.username,
                    avatarUrl: follower.avatarUrl ?? "",
                    bio: follower.bio ?? undefined,
                  }}
                  onClick={() => router.push(`/profile/${follower.id}`)}
                />
              ))}
            </div>
            {followers.length < total && (
              <div className="text-center mt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 text-sm font-bold rounded-full hover:bg-gray-50 dark:hover:bg-white/10 transition dark:text-white disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-card rounded-2xl md:rounded-3xl p-6 md:p-12 border border-gray-100 dark:border-white/10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
            <LuUsers size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold mb-1 dark:text-white">No followers yet</h3>
            <p className="text-sm text-gray-400">When someone follows this user, they&apos;ll appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FollowersPage() {
  return <FollowersContent />;
}
