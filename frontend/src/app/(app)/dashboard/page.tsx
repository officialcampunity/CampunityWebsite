"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Feed from "@/components/Feed";
import StoriesBar from "@/components/StoriesBar";
import PostCreateModal from "@/components/PostCreateModal";
import PostCard from "@/components/PostCard";
import RightSidebar from "@/components/RightSidebar";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { api } from "@/lib/api";
import type { Post } from "@/lib/types";
import { LuFileText, LuImage, LuVideo } from "react-icons/lu";

export default function DashboardPage() {
  const { user } = useAuth();
  const { open: openAuth } = useAuthModal();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [feedKey, setFeedKey] = useState(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  function requireAuth(action: () => void) {
    if (!user) {
      openAuth("login");
    } else {
      action();
    }
  }

  useEffect(() => {
    if (!user) {
      setPosts([]);
      setPostsLoading(false);
      return;
    }
    setPostsLoading(true);
    api.getPosts(1, 20)
      .then((res) => setPosts(res.data))
      .catch(() => {})
      .finally(() => setPostsLoading(false));
  }, [user, feedKey]);

  function handlePostSuccess(newPost: Post) {
    setPosts((prev) => [newPost, ...prev]);
    setFeedKey((k) => k + 1);
  }

  async function handleDeletePost(id: string) {
    try {
      await api.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      /* ignore */
    }
  }

  const canShowPosts = user && posts.length > 0;

  return (
    <div className="flex h-full gap-6">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex-shrink-0">
          <div className="mb-6">
            <div className="bg-white dark:bg-dark-card rounded-[32px] p-3 border border-gray-100 dark:border-white/10">
              <button
                onClick={() => requireAuth(() => setShowModal(true))}
                className="w-full flex items-center gap-3 bg-[#f8f9fa] dark:bg-white/10 rounded-full px-4 py-3 transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-white/20"
              >
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                    alt={user.displayName || "User avatar"}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white text-xs font-bold">
                    {user?.displayName?.charAt(0) || "?"}
                  </div>
                )}
                <span className="text-[15px] text-gray-400 font-medium">
                  What&apos;s on your mind?
                </span>
              </button>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-white/10 px-2">
                <button
                  onClick={() => requireAuth(() => setShowModal(true))}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
                >
                  <LuImage size={18} className="text-green-500" />
                  <span className="hidden sm:inline">Text &amp; Image</span>
                </button>
                <button
                  onClick={() => requireAuth(() => router.push("/upload"))}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
                >
                  <LuFileText size={18} className="text-blue-500" />
                  <span className="hidden sm:inline">Note</span>
                </button>
                <button
                  onClick={() => requireAuth(() => router.push("/stories/new"))}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
                >
                  <LuVideo size={18} className="text-purple-500" />
                  <span className="hidden sm:inline">Story</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <StoriesBar />

        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide space-y-5">
          {canShowPosts && (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={post.author.id === user?.id ? handleDeletePost : undefined}
                />
              ))}
            </div>
          )}

          <Feed key={feedKey} refreshKey={feedKey} />
        </div>
      </div>

      <aside className="hidden xl:block w-80 flex-shrink-0 overflow-y-auto">
        <RightSidebar />
      </aside>

      {showModal && (
        <PostCreateModal
          onClose={() => setShowModal(false)}
          onSuccess={handlePostSuccess}
        />
      )}
    </div>
  );
}
