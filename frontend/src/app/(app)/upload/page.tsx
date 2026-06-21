"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { api } from "@/lib/api";
import { detectFileType, formatFileSize } from "@/lib/file-utils";
import { FILE_ICONS, TYPE_BG_COLORS } from "@/lib/file-icons";
import {
  LuUpload, LuCheck, LuCircleAlert, LuFileText,
  LuBuilding, LuBookOpen, LuCalendar, LuBookMarked,
  LuTrash2, LuImage, LuX, LuGlobe, LuChevronDown,
} from "react-icons/lu";
import DropdownSection from "@/components/DropdownSection";

interface FilterSelection {
  universityId: string;
  universityName: string;
  courseId: string;
  courseName: string;
  semesterId: string;
  semesterName: string;
  subjectId: string;
  subjectName: string;
}

interface SectionItem {
  id: string;
  name: string;
}

const SECTIONS = [
  { key: "university" as const, title: "University", icon: <LuBuilding size={14} />, placeholder: "University" },
  { key: "course" as const, title: "Course", icon: <LuBookOpen size={14} />, placeholder: "Course" },
  { key: "semester" as const, title: "Semester", icon: <LuCalendar size={14} />, placeholder: "Semester" },
  { key: "subject" as const, title: "Subject", icon: <LuBookMarked size={14} />, placeholder: "Subject" },
];

function FilePreview({ file }: { file: File }) {
  const url = URL.createObjectURL(file);
  const type = detectFileType(file.name, file.type);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  if (type === "Image") {
    return <Image src={url} alt="Preview" width={800} height={600} className="w-full h-full object-contain max-h-72" />;
  }
  if (type === "Video") {
    return <video src={url} controls className="w-full max-h-72 object-contain rounded-lg" />;
  }
  if (type === "Audio") {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-6">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
          <LuUpload size={22} className="text-emerald-600 dark:text-emerald-400 rotate-45" />
        </div>
        <audio src={url} controls className="w-full max-w-xs" />
      </div>
    );
  }
  if (type === "PDF") {
    return (
      <object data={url} type="application/pdf" className="w-full h-72">
        <p className="text-sm text-gray-400 text-center p-4">PDF preview not available</p>
      </object>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-6">
      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center">
        {FILE_ICONS[type] || <LuFileText size={22} />}
      </div>
      <p className="text-xs text-gray-400">{type}</p>
    </div>
  );
}

export default function UploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { open } = useAuthModal();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [detectedType, setDetectedType] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showHierarchy, setShowHierarchy] = useState(false);

  const [sel, setSel] = useState<FilterSelection>({
    universityId: "", universityName: "",
    courseId: "", courseName: "",
    semesterId: "", semesterName: "",
    subjectId: "", subjectName: "",
  });

  const [universities, setUniversities] = useState<SectionItem[]>([]);
  const [courses, setCourses] = useState<SectionItem[]>([]);
  const [semesters, setSemesters] = useState<SectionItem[]>([]);
  const [subjects, setSubjects] = useState<SectionItem[]>([]);

  const [loadingUni, setLoadingUni] = useState(true);
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [loadingSem, setLoadingSem] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getUniversities()
      .then(setUniversities)
      .catch(() => setUniversities([]))
      .finally(() => setLoadingUni(false));
  }, []);

  useEffect(() => {
    if (!sel.universityId) { setCourses([]); return; }
    setLoadingCourse(true);
    api.getCourses(sel.universityId)
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourse(false));
  }, [sel.universityId]);

  useEffect(() => {
    if (!sel.courseId) { setSemesters([]); return; }
    setLoadingSem(true);
    api.getSemesters(sel.courseId)
      .then(setSemesters)
      .catch(() => setSemesters([]))
      .finally(() => setLoadingSem(false));
  }, [sel.courseId]);

  useEffect(() => {
    if (!sel.semesterId) { setSubjects([]); return; }
    setLoadingSub(true);
    api.getSubjects(sel.semesterId)
      .then(setSubjects)
      .catch(() => setSubjects([]))
      .finally(() => setLoadingSub(false));
  }, [sel.semesterId]);

  function handleFileSelect(file: File) {
    if (file.size > 50 * 1024 * 1024) {
      setError("File too large. Maximum size is 50 MB.");
      return;
    }
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
    setDetectedType(detectFileType(file.name, file.type));
    setError("");
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
  }

  function handleRemoveFile() {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(null);
    setFilePreview(null);
    setDetectedType("");
  }

  function handleFilter(level: string, id: string, name: string) {
    setSel((p) => {
      const base = { ...p };
      if (level === "university") {
        base.universityId = id; base.universityName = name;
        base.courseId = ""; base.courseName = "";
        base.semesterId = ""; base.semesterName = "";
        base.subjectId = ""; base.subjectName = "";
      } else if (level === "course") {
        base.courseId = id; base.courseName = name;
        base.semesterId = ""; base.semesterName = "";
        base.subjectId = ""; base.subjectName = "";
      } else if (level === "semester") {
        base.semesterId = id; base.semesterName = name;
        base.subjectId = ""; base.subjectName = "";
      } else if (level === "subject") {
        base.subjectId = id; base.subjectName = name;
      }
      return base;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !selectedFile) return;
    setUploading(true);
    setError("");
    try {
      const result = await api.uploadFile(selectedFile);
      await api.createResource({
        title: title.trim(),
        description: description.trim(),
        cloudinaryUrl: result.url,
        fileType: detectedType || result.fileType || "File",
        subjectId: sel.subjectId || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-8 text-center max-w-sm w-full">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
            <LuUpload size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold mb-1 dark:text-white">Sign in to share</h3>
          <p className="text-sm text-gray-400 mb-4">Upload your study materials to help fellow students.</p>
          <button onClick={() => open("login")} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition">
            Login
          </button>
        </div>
      </div>
    );
  }

  const hierarchyLabel = sel.subjectName
    ? `${sel.universityName} > ${sel.courseName} > ${sel.semesterName} > ${sel.subjectName}`
    : "";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg">
      <div className="max-w-xl mx-auto py-6 md:py-10 px-4 pb-28 lg:pb-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 transition"
          >
            <LuX size={18} className="dark:text-white" />
          </button>
          <h1 className="text-lg font-bold dark:text-white">Create Post</h1>
          <div className="w-9" />
        </div>

        {/* Success banner */}
        {success && (
          <div className="mb-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm font-medium">
            <LuCheck size={18} />
            Posted successfully! Redirecting...
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm font-medium">
            <LuCircleAlert size={18} />
            {error}
          </div>
        )}

        {/* Post card */}
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden">
          {/* User bar */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={user.displayName} width={40} height={40} className="w-full h-full object-cover" />
              ) : (
                user.displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-sm font-bold dark:text-white">{user.displayName}</p>
              {hierarchyLabel && (
                <p className="text-xs text-primary truncate max-w-[250px]">{hierarchyLabel}</p>
              )}
            </div>
          </div>

          {!success && (
            <form onSubmit={handleSubmit}>
              {/* Title / Caption */}
              <div className="px-4 pt-2 pb-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's this about?"
                  className="w-full text-lg font-bold bg-transparent outline-none placeholder-gray-400 dark:text-white dark:placeholder-gray-500"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Say something about this resource..."
                  rows={2}
                  className="w-full bg-transparent outline-none resize-none text-sm mt-1 placeholder-gray-400 dark:text-gray-300 dark:placeholder-gray-500"
                />
              </div>

              {/* File preview area */}
              {selectedFile && filePreview && (
                <div className="mx-4 mb-3 bg-gray-50 dark:bg-white/[0.04] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden relative group">
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
                  >
                    <LuTrash2 size={14} />
                  </button>
                  {(detectedType === "Image" || detectedType === "Video" || detectedType === "PDF") ? (
                    <div className="flex items-center justify-center bg-black/5 dark:bg-white/5 max-h-80 overflow-hidden">
                      <FilePreview file={selectedFile} />
                    </div>
                  ) : (
                    <FilePreview file={selectedFile} />
                  )}

                  {/* File info bar */}
                  <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-200 dark:border-white/10">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_BG_COLORS[detectedType] || "bg-gray-100 dark:bg-white/10 text-gray-500"}`}>
                      {FILE_ICONS[detectedType] || <LuFileText size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate dark:text-white">{selectedFile.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(selectedFile.size)} &middot; {detectedType}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Add to your post - file/media selector */}
              <div className="px-4 pb-4">
                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                        <LuImage size={18} className="text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm font-bold dark:text-white">Add to your post</span>
                    </div>
                    <LuChevronDown size={16} className="text-gray-400" />
                  </div>
                ) : null}

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
              </div>

              {/* Hierarchy toggle + dropdowns */}
              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={() => setShowHierarchy(!showHierarchy)}
                  className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-primary transition"
                >
                  <LuGlobe size={14} />
                  {hierarchyLabel ? (
                    <span className="text-primary font-medium truncate max-w-[300px]">{hierarchyLabel}</span>
                  ) : (
                    <span>Add academic category</span>
                  )}
                  <LuChevronDown size={12} />
                </button>

                {showHierarchy && (
                  <div className="mt-3 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { section: SECTIONS[0], items: universities, value: sel.universityId, loading: loadingUni, disabled: false, onChange: (id: string, name: string) => handleFilter("university", id, name) },
                        { section: SECTIONS[1], items: courses, value: sel.courseId, loading: loadingCourse, disabled: !sel.universityId, onChange: (id: string, name: string) => handleFilter("course", id, name) },
                        { section: SECTIONS[2], items: semesters, value: sel.semesterId, loading: loadingSem, disabled: !sel.courseId, onChange: (id: string, name: string) => handleFilter("semester", id, name) },
                        { section: SECTIONS[3], items: subjects, value: sel.subjectId, loading: loadingSub, disabled: !sel.semesterId, onChange: (id: string, name: string) => handleFilter("subject", id, name) },
                      ].map((ds) => (
                        <div key={ds.section.key} className="flex-1 min-w-0 basis-36">
                          <DropdownSection {...ds} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Post button */}
              <div className="px-4 pb-4">
                <button
                  type="submit"
                  disabled={uploading || !title.trim() || !selectedFile}
                  className="w-full py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Posting...
                    </span>
                  ) : (
                    "Post"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
