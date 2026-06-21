"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { LuX, LuChevronLeft, LuChevronRight, LuPlay } from "react-icons/lu";

export interface StoryUser {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  stories: { id: string; url: string; type: "image" | "video" }[];
}

const STORY_DURATION = 4000;

function ProgressBar({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div className="h-0.5 flex-1 rounded-full bg-white/30 overflow-hidden">
      <div
        className={`h-full rounded-full bg-white transition-all duration-100 ${
          done ? "w-full" : active ? "animate-progress" : "w-0"
        }`}
      />
    </div>
  );
}

export default function StoryViewer({
  users,
  initialIndex,
  onClose,
}: {
  users: StoryUser[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [userIndex, setUserIndex] = useState(initialIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentUser = users[userIndex];
  const stories = currentUser?.stories || [];

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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, userIndex, storyIndex, startProgress]);

  function goNext() {
    if (storyIndex < stories.length - 1) {
      setStoryIndex((i) => i + 1);
    } else if (userIndex < users.length - 1) {
      setUserIndex((i) => i + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  }

  function goPrev() {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
    } else if (userIndex > 0) {
      setUserIndex((i) => i - 1);
      const prevStories = users[userIndex - 1]?.stories || [];
      setStoryIndex(prevStories.length - 1);
    }
  }

  function handleTap(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.25) {
      goPrev();
    } else if (x > rect.width * 0.75) {
      goNext();
    } else {
      setPaused((p) => !p);
    }
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
  const content = stories[storyIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      autoFocus
    >
      <div
        className="relative w-[90vw] sm:w-[380px] aspect-[9/16] max-h-[75vh] rounded-2xl overflow-hidden cursor-pointer select-none shadow-2xl"
        onClick={handleTap}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

        {content?.url ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 relative">
            <Image
              src={content.url}
              alt=""
              fill
              className="object-cover rounded-xl shadow-lg"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden ring-4 ring-white/30 mb-3">
              {currentUser?.avatarUrl ? (
                <Image
                  src={currentUser.avatarUrl}
                  alt={currentUser?.displayName || "Your avatar"}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {currentUser?.displayName?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-white text-lg font-bold">
              {currentUser?.displayName}
            </p>
            <p className="text-white/60 text-sm mt-0.5">
              @{currentUser?.username}
            </p>
          </div>
        )}

        <div className="absolute top-0 left-0 right-0 p-3 pt-4">
          <div className="flex gap-1 mb-3">
            {stories.map((_, i) => (
              <ProgressBar
                key={i}
                active={i === storyIndex && !paused}
                done={i < storyIndex}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-white/50 flex-shrink-0">
              {currentUser?.avatarUrl ? (
                  <Image
                    src={currentUser.avatarUrl}
                    alt={currentUser?.displayName || "Your avatar"}
                    width={28}
                    height={28}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/30 flex items-center justify-center text-white text-[10px] font-bold">
                    {currentUser?.displayName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-white text-sm font-bold leading-tight">
                  {currentUser?.displayName}
                </p>
                <p className="text-white/60 text-[10px] leading-tight">
                  Just now
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {paused && <LuPlay size={14} className="text-white/70" />}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition"
              >
                <LuX size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/25 text-[10px] flex items-center gap-2">
          <span className="flex items-center gap-0.5">
            <LuChevronLeft size={10} /> prev
          </span>
          <span>tap to pause</span>
          <span className="flex items-center gap-0.5">
            next <LuChevronRight size={10} />
          </span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes progress {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress ${STORY_DURATION}ms linear forwards;
        }
      `}</style>
    </div>
  );
}