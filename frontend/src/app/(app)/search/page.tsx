"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import NoteCard from "@/components/NoteCard";
import { LuSearch, LuFileText, LuUsers, LuBookOpen } from "react-icons/lu";
import { SkeletonSearchResult } from "@/components/ui/Skeleton";

type SearchTab = "Notes" | "Users" | "Courses";

interface NoteResult {
  id: string;
  title: string;
  description: string;
  fileType: string;
  fileUrl: string;
  author: { id: string; name: string; username: string; avatar: string };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

interface UserResult {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  _count?: { followers: number; following: number };
}

const TABS: { key: SearchTab; icon: React.ReactNode }[] = [
  { key: "Notes", icon: <LuFileText size={14} /> },
  { key: "Users", icon: <LuUsers size={14} /> },
  { key: "Courses", icon: <LuBookOpen size={14} /> },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState<SearchTab>("Notes");
  const [notes, setNotes] = useState<NoteResult[]>([]);
  const [users, setUsers] = useState<UserResult[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [notesPage, setNotesPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [notesTotal, setNotesTotal] = useState(0);
  const [usersTotal, setUsersTotal] = useState(0);

  useEffect(() => {
    setNotesPage(1);
    setUsersPage(1);
    if (!query.trim()) {
      setNotes([]);
      setUsers([]);
      setCourses([]);
      setHasSearched(false);
      return;
    }
  }, [query, activeTab]);

  useEffect(() => {
    if (!query.trim()) return;

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const q = query.trim();
        if (activeTab === "Notes") {
          const res = await api.searchResources(q, notesPage);
          if (notesPage === 1) {
            setNotes(res.data.map((r: any) => ({
              id: r.id,
              title: r.title,
              description: r.description || '',
              fileType: r.fileType,
              fileUrl: r.cloudinaryUrl,
              author: { id: r.author.id, name: r.author.displayName, username: r.author.username, avatar: r.author.avatarUrl || '' },
              createdAt: r.createdAt,
              likesCount: r.likes?.length || 0,
              commentsCount: r.comments?.length || 0,
              isLiked: r.isLiked || false,
            })));
          } else {
            setNotes((prev) => [...prev, ...res.data.map((r: any) => ({
              id: r.id,
              title: r.title,
              description: r.description || '',
              fileType: r.fileType,
              fileUrl: r.cloudinaryUrl,
              author: { id: r.author.id, name: r.author.displayName, username: r.author.username, avatar: r.author.avatarUrl || '' },
              createdAt: r.createdAt,
              likesCount: r.likes?.length || 0,
              commentsCount: r.comments?.length || 0,
              isLiked: r.isLiked || false,
            }))]);
          }
          setNotesTotal(res.total);
        } else if (activeTab === "Users") {
          const res = await api.searchUsers(q, usersPage);
          if (usersPage === 1) {
            setUsers(res.data as any);
          } else {
            setUsers((prev) => [...prev, ...res.data as any]);
          }
          setUsersTotal(res.total);
        } else {
          const data = await api.searchCourses(q);
          setCourses(Array.isArray(data) ? data : []);
        }
      } catch {
        /* ignore */
      } finally {
        setSearching(false);
        setHasSearched(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, activeTab, notesPage, usersPage]);

  return (
    <div className="py-4 animate-fadeIn">
      <div className="mb-5">
        <h1 className="text-2xl font-bold dark:text-white mb-1">Search</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Find notes, people, and courses</p>
      </div>

      <div className="relative mb-5">
        <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes, users, courses..."
          className="w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition dark:text-white dark:placeholder-gray-500"
          autoFocus
        />
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map(({ key, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-full transition ${
              activeTab === key
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20"
            }`}
          >
            {icon}
            {key}
          </button>
        ))}
      </div>

      {searching && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ animationDelay: `${i * 100}ms`, animationFillMode: "backwards" }}>
              <SkeletonSearchResult />
            </div>
          ))}
        </div>
      )}

      {!searching && hasSearched && activeTab === "Notes" && notes.length === 0 && (
        <div className="bg-white dark:bg-dark-card rounded-3xl p-12 border border-gray-100 dark:border-white/10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
            <LuFileText size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold mb-1 dark:text-white">No notes found</h3>
          <p className="text-sm text-gray-400">Try a different search term</p>
        </div>
      )}

      {!searching && hasSearched && activeTab === "Users" && users.length === 0 && (
        <div className="bg-white dark:bg-dark-card rounded-3xl p-12 border border-gray-100 dark:border-white/10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
            <LuUsers size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold mb-1 dark:text-white">No users found</h3>
          <p className="text-sm text-gray-400">Try a different search term</p>
        </div>
      )}

      {!searching && hasSearched && activeTab === "Courses" && courses.length === 0 && (
        <div className="bg-white dark:bg-dark-card rounded-3xl p-12 border border-gray-100 dark:border-white/10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
            <LuBookOpen size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold mb-1 dark:text-white">No courses found</h3>
          <p className="text-sm text-gray-400">Try a different search term</p>
        </div>
      )}

      {!searching && activeTab === "Notes" && notes.length > 0 && (
        <div className="space-y-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={{
                ...note,
                cloudinaryUrl: note.fileUrl,
                author: { id: note.author.id, displayName: note.author.name, username: note.author.username, avatarUrl: note.author.avatar },
              }}
              onClick={() => window.location.href = `/notes/${note.id}`}
            />
          ))}
          {notes.length < notesTotal && (
            <div className="text-center">
              <button
                onClick={() => setNotesPage((p) => p + 1)}
                className="px-8 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 text-sm font-bold rounded-full hover:bg-gray-50 dark:hover:bg-white/10 transition dark:text-white"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}

      {!searching && activeTab === "Users" && users.length > 0 && (
        <div className="space-y-3">
          {users.map((u) => (
            <Link
              key={u.id}
              href={`/profile/${u.id}`}
              className="flex items-center gap-4 bg-white dark:bg-dark-card rounded-2xl p-4 border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                {u.avatarUrl ? (
                  <Image src={u.avatarUrl} alt={u.displayName} width={48} height={48} className="w-full h-full object-cover" />
                ) : (
                  u.displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm dark:text-white truncate">{u.displayName}</p>
                <p className="text-xs text-gray-400">@{u.username}</p>
                {u.bio && <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-1">{u.bio}</p>}
              </div>
              <div className="text-xs text-gray-400 text-right flex-shrink-0">
                <p className="font-bold text-gray-700 dark:text-gray-300">{u._count?.followers ?? 0}</p>
                <p>followers</p>
              </div>
            </Link>
          ))}
          {users.length < usersTotal && (
            <div className="text-center">
              <button
                onClick={() => setUsersPage((p) => p + 1)}
                className="px-8 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 text-sm font-bold rounded-full hover:bg-gray-50 dark:hover:bg-white/10 transition dark:text-white"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}

      {!searching && activeTab === "Courses" && courses.length > 0 && (
        <div className="space-y-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/search?subject=${encodeURIComponent(course.name)}`}
              className="flex items-center gap-4 bg-white dark:bg-dark-card rounded-2xl p-4 border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                {course.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm dark:text-white truncate">{course.name}</p>
                {course.code && <p className="text-xs text-gray-400">{course.code}</p>}
                {course.university && <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{course.university.name}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}

      {!searching && !hasSearched && !query && (
        <div className="bg-white dark:bg-dark-card rounded-3xl p-12 border border-gray-100 dark:border-white/10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
            <LuSearch size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold mb-1 dark:text-white">Search Campunity</h3>
          <p className="text-sm text-gray-400">Find notes, connect with classmates, discover courses</p>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
