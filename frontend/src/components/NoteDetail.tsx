"use client";

import { useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { FILE_ICONS, TYPE_BG_COLORS } from "@/lib/file-icons";
import { formatFileSize } from "@/lib/file-utils";
import CommentSection from "./CommentSection";
import { LuArrowLeft, LuFileText, LuArrowUpRight, LuPlay, LuLink, LuHeart, LuTrash2, LuDownload, LuMusic, LuFileArchive, LuFileCode } from "react-icons/lu";

interface NoteDetailProps {
  note: {
    id: string;
    title: string;
    description: string;
    fileType: string;
    fileUrl: string;
    author: { id: string; name: string; username: string; avatar: string; bio?: string };
    createdAt: string;
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
    university?: string;
    course?: string;
    subject?: string;
  };
  currentUserId?: string | null;
  onLike?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
}

export default function NoteDetail({ note, currentUserId, onLike, onDelete, onBack }: NoteDetailProps) {
  const [liked, setLiked] = useState(note.isLiked);
  const [likesCount, setLikesCount] = useState(note.likesCount);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = currentUserId === note.author.id;

  async function handleLike() {
    try {
      if (liked) {
        await api.unlikeResource(note.id);
      } else {
        await api.likeResource(note.id);
      }
      setLiked(!liked);
      setLikesCount((c) => (liked ? c - 1 : c + 1));
      onLike?.();
    } catch (e) {
      console.error('Failed to toggle like:', e);
    }
  }

  async function handleDelete() {
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await api.deleteResource(note.id);
      onDelete?.();
    } catch {
      setDeleting(false);
    }
    setShowDeleteModal(false);
  }

  return (
    <div className="dark:bg-dark-card rounded-3xl border-gray-100 dark:border-white/10 overflow-hidden">
      <div className="p-6">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-black dark:hover:text-white mb-4 transition"
          >
            <LuArrowLeft size={16} />
            Back
          </button>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white font-bold flex-shrink-0">
            {note.author.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold dark:text-white">{note.author.name}</h4>
            <p className="text-xs text-gray-400">@{note.author.username} • {new Date(note.createdAt).toLocaleDateString()}</p>
            {note.author.bio && <p className="text-xs text-gray-500 mt-0.5">{note.author.bio}</p>}
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2 dark:text-white">{note.title}</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-wrap">{note.description}</p>

        {(note.university || note.course || note.subject) && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-6 flex-wrap">
            {note.university && (
              <span className="px-2.5 py-1 bg-primary/5 text-primary dark:text-primary rounded-full">{note.university}</span>
            )}
            {note.course && (
              <>
                <span className="text-gray-300 dark:text-gray-600">›</span>
                <span className="px-2.5 py-1 bg-primary/5 text-primary dark:text-primary rounded-full">{note.course}</span>
              </>
            )}
            {note.subject && (
              <>
                <span className="text-gray-300 dark:text-gray-600">›</span>
                <span className="px-2.5 py-1 bg-primary/5 text-primary dark:text-primary rounded-full">{note.subject}</span>
              </>
            )}
          </div>
        )}

        <div className="mb-6">
          {note.fileType === "Image" && note.fileUrl && (
            <div className="relative w-full max-h-[500px] bg-gray-50 dark:bg-white/5 rounded-2xl overflow-hidden">
              <Image src={note.fileUrl} alt={note.title} fill className="object-contain" />
            </div>
          )}

          {note.fileType === "Video" && note.fileUrl && (
            <div className="w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden">
              <video src={note.fileUrl} controls className="w-full h-full" />
            </div>
          )}

          {note.fileType === "Audio" && note.fileUrl && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <LuMusic size={22} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold dark:text-white mb-2">Audio</p>
                <audio src={note.fileUrl} controls className="w-full" />
              </div>
            </div>
          )}

          {note.fileType === "PDF" && note.fileUrl && (
            <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
              <iframe
                src={note.fileUrl}
                className="w-full h-[500px] bg-white"
                title={note.title}
              />
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10">
                <span className="text-sm text-gray-500">PDF Document</span>
                <a
                  href={note.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <LuArrowUpRight size={14} />
                  Open
                </a>
              </div>
            </div>
          )}

          {note.fileType === "Document" && note.fileUrl && (
            <a
              href={note.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${TYPE_BG_COLORS.Document}`}>
                <LuFileText size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm group-hover:underline truncate">Document</p>
                <p className="text-xs text-gray-400 truncate">{note.fileUrl.split("/").pop()}</p>
              </div>
              <LuDownload size={16} className="text-gray-400" />
            </a>
          )}

          {note.fileType === "Archive" && note.fileUrl && (
            <a
              href={note.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${TYPE_BG_COLORS.Archive}`}>
                <LuFileArchive size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm group-hover:underline truncate">Archive</p>
                <p className="text-xs text-gray-400 truncate">{note.fileUrl.split("/").pop()}</p>
              </div>
              <LuDownload size={16} className="text-gray-400" />
            </a>
          )}

          {note.fileType === "Code" && note.fileUrl && (
            <a
              href={note.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${TYPE_BG_COLORS.Code}`}>
                <LuFileCode size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm group-hover:underline truncate">Code</p>
                <p className="text-xs text-gray-400 truncate">{note.fileUrl.split("/").pop()}</p>
              </div>
              <LuDownload size={16} className="text-gray-400" />
            </a>
          )}

          {note.fileType === "Link" && note.fileUrl && (
            <a
              href={note.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center">
                <LuLink size={22} className="text-sky-600 dark:text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm group-hover:underline truncate">External Link</p>
                <p className="text-xs text-gray-400 truncate">{note.fileUrl}</p>
              </div>
              <LuArrowUpRight size={16} className="text-gray-400" />
            </a>
          )}

          {(note.fileType === "File" || (!["Image","Video","Audio","PDF","Document","Archive","Code","Link"].includes(note.fileType) && note.fileUrl)) && (
            <a
              href={note.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${TYPE_BG_COLORS.File}`}>
                <LuFileText size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm group-hover:underline truncate">{note.fileType}</p>
                <p className="text-xs text-gray-400 truncate">{note.fileUrl.split("/").pop()}</p>
              </div>
              <LuDownload size={16} className="text-gray-400" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-gray-100 dark:border-white/10 pt-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition ${
              liked ? "bg-red-50 text-red-600" : "bg-gray-50 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600"
            }`}
          >
            <LuHeart size={18} fill={liked ? "currentColor" : "none"} />
            {likesCount}
          </button>

          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition disabled:opacity-50 ml-auto"
            >
              <LuTrash2 size={16} />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-white/10">
        <CommentSection resourceId={note.id} />
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Delete note confirmation">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !deleting && setShowDeleteModal(false)} aria-label="Close modal" />
          <div className="relative w-full max-w-sm bg-white dark:bg-dark-card rounded-3xl p-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </div>
              <h3 className="text-lg font-bold dark:text-white mb-2">Delete this note?</h3>
              <p className="text-sm text-gray-400">This action cannot be undone. The note and all its content will be permanently removed.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} disabled={deleting} className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition disabled:opacity-50" aria-label="Cancel delete">Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2" aria-label="Confirm delete">
                {deleting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
