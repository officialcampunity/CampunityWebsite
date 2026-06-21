"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Feed from "@/components/Feed";
import StoriesBar from "@/components/StoriesBar";
import RightSidebar from "@/components/RightSidebar";
import { useAuth } from "@/lib/auth-context";
import {
  LuPaperclip,
  LuX,
} from "react-icons/lu";

type FileInfo = {
  file: File;
  type: string;
  previewUrl: string | null;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [text, setText] = useState("");
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [feedKey, setFeedKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const previewUrl = f.type.startsWith("image/") || f.type.startsWith("video/")
      ? URL.createObjectURL(f)
      : null;
    setFileInfo({ file: f, type: f.type, previewUrl });
  }

  function removeFile() {
    if (fileInfo?.previewUrl) URL.revokeObjectURL(fileInfo.previewUrl);
    setFileInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handlePost() {
    if (!text.trim() && !fileInfo) return;
    const params = new URLSearchParams();
    if (text.trim()) params.set("text", text.trim());
    router.push(`/notes/new?${params.toString()}`);
  }

  const canPost = text.trim() || fileInfo;

  return (
    <div className="flex h-full gap-6">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex-shrink-0">
          <div className="mb-6">
            <div className="bg-white dark:bg-dark-card rounded-[32px] p-3 border border-gray-100 dark:border-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 bg-[#f8f9fa] dark:bg-white/10 rounded-full px-4 py-3 mb-3 transition-colors duration-300">
                {user?.avatarUrl ? (
                  <Image src={user.avatarUrl} width={32} height={32} className="w-8 h-8 rounded-full object-cover" alt={user.displayName || "User avatar"} />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white text-xs font-bold">
                    {user?.displayName?.charAt(0) || "?"}
                  </div>
                )}
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Share your study notes..."
                  className="bg-transparent flex-1 outline-none text-[15px] font-medium text-gray-800 dark:text-white placeholder-gray-400 transition-colors duration-300"
                />
              </div>

              {fileInfo && (
                <div className="flex items-center justify-between px-4 pb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{fileInfo.file.name}</span>
                  <button
                    onClick={removeFile}
                    className="w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition"
                  >
                    <LuX size={14} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between px-4 pb-1">
                <div className="flex items-center gap-6 text-[15px] font-bold text-gray-800 dark:text-white/80">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 hover:text-black dark:hover:text-white transition-all duration-300 ease-out active:scale-95"
                  >
                    <LuPaperclip size={18} />
                    {fileInfo ? fileInfo.file.name : "Attach"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFilePick}
                  />
                </div>

                <button
                  onClick={handlePost}
                  disabled={!canPost}
                  className="bg-primary text-white px-8 py-2.5 rounded-full hover:bg-primary/90 disabled:opacity-40 transition-all duration-300 ease-out active:scale-[0.97]"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden">
          <StoriesBar />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
          <Feed key={feedKey} refreshKey={feedKey} />
        </div>
      </div>

      <aside className="hidden xl:block w-80 flex-shrink-0 overflow-y-auto">
        <RightSidebar />
      </aside>

    </div>
  );
}
