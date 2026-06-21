"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { api } from "@/lib/api";
import { LuImage, LuVideo, LuCalendarClock, LuClock, LuCheck, LuCircleAlert, LuUpload, LuX } from "react-icons/lu";

export default function CreateStoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { open } = useAuthModal();
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [schedule, setSchedule] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  }

  function removeFile() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please select a media file"); return; }
    setUploading(true);
    setError("");

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      let mediaUrl: string;

      if (cloudName && uploadPreset) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", uploadPreset);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!data.secure_url) throw new Error("Upload failed");
        mediaUrl = data.secure_url;
      } else {
        const result = await api.uploadFile(file);
        mediaUrl = result.url;
      }

      let scheduledAt: string | undefined;
      if (schedule && scheduledDate && scheduledTime) {
        scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      }

      await api.createStory({
        mediaUrl,
        mediaType,
        caption: caption.trim() || undefined,
        scheduledAt,
      });

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create story");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
          <LuUpload size={28} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-bold mb-1 dark:text-white">Sign in to share a story</h3>
        <p className="text-sm text-gray-400 mb-4">Share moments that disappear after 24 hours.</p>
        <button onClick={() => open("login")} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition">
          Login
        </button>
      </div>
    );
  }

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] max-w-2xl mx-auto py-3 px-4">
      <div className="mb-3">
        <h1 className="text-lg md:text-xl font-bold dark:text-white">Create a Story</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Your story will be visible for 24 hours</p>
      </div>

      {success && (
        <div className="mb-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 rounded-xl px-4 py-2 flex items-center gap-2 text-xs font-medium animate-fadeIn">
          <LuCheck size={16} />
          Story posted{schedule ? " — scheduled" : ""}! Redirecting...
        </div>
      )}

      {error && (
        <div className="mb-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-2 flex items-center gap-2 text-xs font-medium">
          <LuCircleAlert size={16} />
          {error}
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMediaType("image")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition ${
                mediaType === "image"
                  ? "bg-primary text-white border-primary"
                  : "bg-white dark:bg-dark-card border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-gray-300"
              }`}
            >
              <LuImage size={18} />
              Image
            </button>
            <button
              type="button"
              onClick={() => setMediaType("video")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition ${
                mediaType === "video"
                  ? "bg-primary text-white border-primary"
                  : "bg-white dark:bg-dark-card border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-gray-300"
              }`}
            >
              <LuVideo size={18} />
              Video
            </button>
          </div>

          <div
            onClick={() => !file && inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl overflow-hidden transition ${
              file
                ? "border-primary/50"
                : "border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 cursor-pointer"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleFilePick}
              accept={mediaType === "image" ? "image/*" : "video/*"}
            />
            {preview ? (
              <div className="relative">
                {mediaType === "image" ? (
                  <img src={preview} className="w-full max-h-[50vh] object-contain bg-black/5 dark:bg-black/30" alt="" />
                ) : (
                  <video src={preview} controls className="w-full max-h-[50vh] bg-black/5 dark:bg-black/30" />
                )}
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition"
                >
                  <LuX size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <LuUpload size={32} className="mx-auto mb-3 text-gray-400" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Tap to select a {mediaType}</p>
                <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 dark:text-white">Caption (optional)</label>
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Add a caption..."
              maxLength={120}
              className="w-full bg-gray-50 dark:bg-white/[0.07] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition dark:text-white dark:placeholder-gray-500"
            />
          </div>

          <div className="bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/10 rounded-xl p-4">
            <button
              type="button"
              onClick={() => setSchedule(!schedule)}
              className="flex items-center gap-2 text-sm font-semibold dark:text-white"
            >
              <LuCalendarClock size={16} className={schedule ? "text-primary" : "text-gray-400"} />
              Schedule for later
              <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                schedule ? "border-primary bg-primary" : "border-gray-300 dark:border-gray-500"
              }`}>
                {schedule && <LuCheck size={12} className="text-white" />}
              </div>
            </button>
            {schedule && (
              <div className="flex gap-3 mt-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    min={tomorrow}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    className="w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {schedule ? "Scheduling..." : "Uploading..."}
                </>
              ) : (
                <>
                  <LuClock size={16} />
                  {schedule ? "Schedule Story" : "Post Story"}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
