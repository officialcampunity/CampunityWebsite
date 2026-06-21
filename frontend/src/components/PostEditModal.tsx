"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Post } from "@/lib/types";
import { LuX, LuImage, LuSave } from "react-icons/lu";

interface Props {
  post: Post;
  onClose: () => void;
  onSuccess: (post: Post) => void;
}

export default function PostEditModal({ post, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [content, setContent] = useState(post.content);
  const [imageUrl, setImageUrl] = useState(post.imageUrl || "");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const formData = new FormData();
      formData.append("file", f);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ""}/resources/upload`,
        { method: "POST", credentials: "include", body: formData }
      );
      const data = await res.json();
      setImageUrl(data.url || "");
    } catch { /* ignore */ }
  }

  function removeImage() {
    setImageUrl("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const updated = await api.updatePost(post.id, {
        content: content.trim(),
        imageUrl: imageUrl || undefined,
      });
      onSuccess(updated);
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 pb-3 border-b border-gray-100 dark:border-white/10">
          <h2 className="text-lg font-bold dark:text-white">Edit Post</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 transition">
            <LuX size={16} />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            {user?.avatarUrl ? (
              <Image src={user.avatarUrl} width={40} height={40} className="w-10 h-10 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white font-bold text-sm">
                {user?.displayName?.charAt(0) || "?"}
              </div>
            )}
            <p className="font-bold text-sm dark:text-white">{user?.displayName}</p>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full resize-none bg-transparent outline-none text-[15px] dark:text-white placeholder-gray-400 leading-relaxed"
          />

          {imageUrl ? (
            <div className="relative mt-3 rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/10">
              <Image src={imageUrl} width={500} height={300} className="w-full max-h-64 object-contain" alt="" />
              <button onClick={removeImage} className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition">
                <LuX size={14} />
              </button>
            </div>
          ) : null}
        </div>

        <div className="px-4 sm:px-6 pb-4 flex items-center justify-between">
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition">
            <LuImage size={18} />
            {imageUrl ? "Change Image" : "Add Image"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button
            onClick={handleSave}
            disabled={!content.trim() || saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 disabled:opacity-40 transition-all active:scale-[0.97]"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <LuSave size={15} />
            )}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
