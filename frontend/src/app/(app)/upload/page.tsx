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
  LuTrash2,
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
  { key: "university" as const, title: "University", icon: <LuBuilding size={16} />, placeholder: "Select a university" },
  { key: "course" as const, title: "Course", icon: <LuBookOpen size={16} />, placeholder: "Select a course" },
  { key: "semester" as const, title: "Semester", icon: <LuCalendar size={16} />, placeholder: "Select a semester" },
  { key: "subject" as const, title: "Subject", icon: <LuBookMarked size={16} />, placeholder: "Select a subject" },
];

function FilePreview({ file }: { file: File }) {
  const url = URL.createObjectURL(file);
  const type = detectFileType(file.name, file.type);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  if (type === "Image") {
    return <Image src={url} alt="Preview" width={800} height={600} className="w-full h-full object-contain" />;
  }
  if (type === "Video") {
    return (
      <video src={url} controls className="w-full h-full object-contain" />
    );
  }
  if (type === "Audio") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
          <LuUpload size={28} className="text-emerald-600 dark:text-emerald-400 rotate-45" />
        </div>
        <audio src={url} controls className="w-full max-w-xs" />
      </div>
    );
  }
  if (type === "PDF") {
    return (
      <object data={url} type="application/pdf" className="w-full h-full">
        <p className="text-sm text-gray-400 text-center p-4">PDF preview not available</p>
      </object>
    );
  }

  return null;
}

function DragDropZone({ onFileSelect }: { onFileSelect: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onFileSelect(file);
      }}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
        dragging
          ? "border-primary bg-primary/5"
          : "border-gray-200 dark:border-white/10 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-white/5"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />
      <LuUpload size={36} className="mx-auto mb-3 text-gray-400" />
      <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Drag & drop or click to upload</p>
      <p className="text-xs text-gray-400 mt-1">Any file type — up to 50 MB</p>
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
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
            <LuUpload size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold mb-1 dark:text-white">Sign in to share a note</h3>
          <p className="text-sm text-gray-400 mb-4">Upload your study notes to help fellow students.</p>
          <button onClick={() => open("login")} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition">
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <div className="max-w-3xl mx-auto py-6 md:py-10 px-4 pb-24 lg:pb-0">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-1 dark:text-white">Upload a Note</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            Share your study materials with the community
          </p>
        </div>

        {success && (
          <div className="mb-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm font-medium animate-fadeIn">
            <LuCheck size={18} />
            Note uploaded successfully! Redirecting...
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm font-medium">
            <LuCircleAlert size={18} />
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-bold mb-2 dark:text-white">File</label>
              {selectedFile ? (
                <div className="bg-gray-50 dark:bg-white/[0.04] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
                  {/* Preview area */}
                  {filePreview && (detectedType === "Image" || detectedType === "Video" || detectedType === "PDF") && (
                    <div className="h-64 bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                      {detectedType === "Image" && (
                        <Image src={filePreview} alt="Preview" width={800} height={600} className="w-full h-full object-contain" />
                      )}
                      {detectedType === "Video" && (
                        <video src={filePreview} controls className="w-full h-full object-contain" />
                      )}
                      {detectedType === "PDF" && (
                        <object data={filePreview} type="application/pdf" className="w-full h-full">
                          <p className="text-sm text-gray-400 text-center p-4">PDF preview not available</p>
                        </object>
                      )}
                    </div>
                  )}

                  {filePreview && detectedType === "Audio" && (
                    <div className="h-32 flex flex-col items-center justify-center gap-3 px-4">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                        <LuUpload size={24} className="text-emerald-600 dark:text-emerald-400 rotate-45" />
                      </div>
                      <audio src={filePreview} controls className="w-full max-w-sm" />
                    </div>
                  )}

                  {/* File info bar */}
                  <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-200 dark:border-white/10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_BG_COLORS[detectedType] || "bg-gray-100 dark:bg-white/10 text-gray-500"}`}>
                      {FILE_ICONS[detectedType] || <LuFileText size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate dark:text-white">{selectedFile.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(selectedFile.size)} · {detectedType}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-500 transition"
                    >
                      <LuTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <DragDropZone onFileSelect={handleFileSelect} />
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-bold mb-2 dark:text-white">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your note..."
                className="w-full bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition dark:text-white dark:placeholder-gray-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold mb-2 dark:text-white">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your note..."
                rows={3}
                className="w-full bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition resize-none dark:text-white dark:placeholder-gray-500"
              />
            </div>

            {/* Academic Category */}
            <div>
              <label className="block text-sm font-bold mb-2 dark:text-white">Academic Category</label>
              <p className="text-xs text-gray-400 mb-3">
                Select where your note belongs to help others find it
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { section: SECTIONS[0], items: universities, value: sel.universityId, loading: loadingUni, disabled: false, onChange: (id: string, name: string) => handleFilter("university", id, name) },
                  { section: SECTIONS[1], items: courses, value: sel.courseId, loading: loadingCourse, disabled: !sel.universityId, onChange: (id: string, name: string) => handleFilter("course", id, name) },
                  { section: SECTIONS[2], items: semesters, value: sel.semesterId, loading: loadingSem, disabled: !sel.courseId, onChange: (id: string, name: string) => handleFilter("semester", id, name) },
                  { section: SECTIONS[3], items: subjects, value: sel.subjectId, loading: loadingSub, disabled: !sel.semesterId, onChange: (id: string, name: string) => handleFilter("subject", id, name) },
                ].map((ds) => (
                  <div key={ds.section.key} className="flex-1 min-w-0 basis-40">
                    <DropdownSection {...ds} />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !title.trim() || !selectedFile}
                className="flex-1 py-3 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition disabled:opacity-50"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  "Upload Note"
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
