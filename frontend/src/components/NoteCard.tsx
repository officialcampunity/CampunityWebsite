"use client";

import Image from "next/image";
import Link from "next/link";
import { LuHeart, LuMessageCircle, LuFileText, LuChevronRight } from "react-icons/lu";
import { FILE_ICONS, TYPE_BG_COLORS } from "@/lib/file-icons";

interface NoteAuthor {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
}

interface NoteCardNote {
  id: string;
  title: string;
  description: string;
  fileType: string;
  cloudinaryUrl: string;
  author: NoteAuthor;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  hierarchy?: {
    university: string;
    course: string;
    semester: string;
    subject: string;
    resourceType: string;
  };
}

interface NoteCardProps {
  note: NoteCardNote;
  onLike?: () => void;
  onClick?: () => void;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const bgColors = ["bg-[#ebf2fe]", "bg-[#fcf5e3]", "bg-[#f5eef9]", "bg-[#edf7f2]"];

export default function NoteCard({ note, onLike, onClick }: NoteCardProps) {
  const numId = note.id.charCodeAt(0) + note.id.charCodeAt(note.id.length - 1);
  const cardBg = bgColors[numId % bgColors.length];

  return (
    <div
      onClick={onClick}
      className={`rounded-[32px] p-6 mb-5 transition-all duration-300 ease-out cursor-pointer relative ${cardBg} dark:bg-dark-card hover:scale-[1.01] active:scale-[0.99]`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/profile/${note.author.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-white flex-shrink-0"
          >
            {note.author.avatarUrl ? (
              <Image src={note.author.avatarUrl} alt={note.author.displayName} width={48} height={48} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white font-bold">
                {note.author.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div>
            <Link
              href={`/profile/${note.author.id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-bold text-[16px] text-gray-900 dark:text-white hover:underline"
            >
              {note.author.displayName}
            </Link>
            <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium mt-0.5">
              <span>{timeAgo(note.createdAt)}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                {FILE_ICONS[note.fileType] || <LuFileText size={14} />}
                {note.fileType}
              </span>
            </div>
          </div>
        </div>
      </div>

      {note.hierarchy && (
        <div className="flex flex-wrap items-center gap-1 mb-3 text-[11px] text-gray-500 font-medium">
          {note.hierarchy.resourceType && (
            <span className="px-2 py-0.5 bg-white/60 dark:bg-white/10 rounded-full">{note.hierarchy.resourceType}</span>
          )}
          <span className="text-gray-300">·</span>
          <span>{note.hierarchy.university}</span>
          <LuChevronRight size={10} className="text-gray-300" />
          <span>{note.hierarchy.course}</span>
          <LuChevronRight size={10} className="text-gray-300" />
          <span>{note.hierarchy.semester}</span>
          <LuChevronRight size={10} className="text-gray-300" />
          <span className="font-semibold text-gray-700 dark:text-gray-300">{note.hierarchy.subject}</span>
        </div>
      )}

      <p className="text-[15px] text-gray-800 dark:text-white/80 font-medium mb-4 leading-relaxed">
        {note.description || note.title}
      </p>

      {note.cloudinaryUrl && note.fileType === "Image" && (
        <div className="flex gap-2 h-[260px] mb-4 relative rounded-3xl overflow-hidden">
          <div className="w-full h-full overflow-hidden rounded-3xl relative">
            <Image src={note.cloudinaryUrl} fill className="object-cover hover:scale-105 transition duration-500" alt="Post" />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-gray-500 font-medium text-[13px] px-1 mt-2">
        <div className="flex items-center gap-6">
          <button
            onClick={(e) => { e.stopPropagation(); onLike?.(); }}
            className={`flex items-center gap-1.5 transition-all duration-300 ease-out active:scale-90 ${note.isLiked ? "text-pink-500" : "hover:text-pink-500"}`}
          >
            <LuHeart size={18} fill={note.isLiked ? "currentColor" : "none"} />
            <span className={note.isLiked ? "text-pink-500 font-bold" : ""}>{note.likesCount}</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-gray-800 dark:hover:text-white transition-all duration-300 ease-out active:scale-90">
            <LuMessageCircle size={18} />
            <span>{note.commentsCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
