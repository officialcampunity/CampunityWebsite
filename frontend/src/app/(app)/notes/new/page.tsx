"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { api } from "@/lib/api";
import NoteForm from "@/components/NoteForm";
import { LuUpload, LuCheck, LuCircleAlert, LuFileText } from "react-icons/lu";

function DragDropZone({ onFileUrl }: { onFileUrl: (url: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  async function uploadFile(file: File) {
    try {
      const result = await api.uploadFile(file);
      onFileUrl(result.url);
    } catch { /* ignore */ }
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
        dragging
          ? "border-primary bg-primary/[0.03] dark:bg-primary/5"
          : "border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 hover:bg-gray-50 dark:hover:bg-white/5"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,.txt"
      />
      <LuUpload size={24} className="mx-auto mb-2 text-gray-400" />
      <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Drop file here</p>
      <p className="text-[11px] text-gray-400 mt-0.5">or click to browse</p>
    </div>
  );
}

function CreateNoteContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { open } = useAuthModal();
  const [fileUrl, setFileUrl] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const initialText = searchParams.get("text") || "";

  async function handleSubmit(data: {
    title: string;
    description: string;
    fileUrl: string;
    fileType: string;
    universityId?: string;
    courseId?: string;
    semesterId?: string;
    subjectId?: string;
  }) {
    setError("");
    if (!data.subjectId) {
      setError("Please select a subject category before uploading");
      return;
    }
    try {
      await api.createResource({
        title: data.title,
        description: data.description,
        cloudinaryUrl: data.fileUrl || undefined,
        fileType: data.fileType,
        subjectId: data.subjectId,
      });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
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
        <h3 className="text-lg font-bold mb-1 dark:text-white">Sign in to share a note</h3>
        <p className="text-sm text-gray-400 mb-4">Upload your study notes to help fellow students.</p>
        <button onClick={() => open("login")} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition">
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] max-w-5xl mx-auto py-3 px-4">
      <div className="mb-3">
        <h1 className="text-lg md:text-xl font-bold dark:text-white">Share a Note</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Upload your study notes to help fellow students</p>
      </div>

      {success && (
        <div className="mb-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 rounded-xl px-4 py-2 flex items-center gap-2 text-xs font-medium animate-fadeIn">
          <LuCheck size={16} />
          Note uploaded successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="mb-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-2 flex items-center gap-2 text-xs font-medium">
          <LuCircleAlert size={16} />
          {error}
        </div>
      )}

      {!success && (
        <div className="flex flex-col lg:flex-row gap-3 h-[calc(100%-4.5rem)]">
          <div className="lg:w-[260px] flex-shrink-0">
            <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-white/10 h-full flex flex-col p-3">
              <DragDropZone onFileUrl={setFileUrl} />
              {fileUrl && (
                <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-3 py-2 rounded-lg mt-2">
                  <LuFileText size={14} />
                  File ready
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0 overflow-y-auto">
            <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-white/10 p-3 md:p-4">
              <NoteForm
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                initialData={{ title: initialText || "", description: initialText, fileUrl, fileType: "Note" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateNotePage() {
  return <CreateNoteContent />;
}
