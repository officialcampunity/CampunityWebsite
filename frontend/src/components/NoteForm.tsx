"use client";

import { useState } from "react";
import HierarchySelector from "./HierarchySelector";

interface NoteFormProps {
  onSubmit?: (data: FormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: {
    title: string;
    description: string;
    fileUrl: string;
    fileType: string;
    universityId?: string;
    courseId?: string;
    semesterId?: string;
    subjectId?: string;
  };
}

interface FormData {
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  universityId?: string;
  courseId?: string;
  semesterId?: string;
  subjectId?: string;
}

const FILE_TYPES = [
  { value: "Note", label: "Note" },
  { value: "PDF", label: "PDF" },
  { value: "Image", label: "Image" },
  { value: "Video", label: "Video" },
  { value: "Link", label: "Link" },
];

export default function NoteForm({ onSubmit, onCancel, initialData }: NoteFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [fileUrl, setFileUrl] = useState(initialData?.fileUrl ?? "");
  const [fileType, setFileType] = useState(initialData?.fileType ?? "Note");
  const [hierarchy, setHierarchy] = useState({
    universityId: initialData?.universityId ?? "",
    courseId: initialData?.courseId ?? "",
    semesterId: initialData?.semesterId ?? "",
    subjectId: initialData?.subjectId ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [hierarchyError, setHierarchyError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHierarchyError("");
    if (!title.trim() || submitting) return;
    if (!hierarchy.subjectId) {
      setHierarchyError("Please select a subject category");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit?.({
        title: title.trim(),
        description: description.trim(),
        fileUrl: fileUrl.trim(),
        fileType,
        ...hierarchy,
      });
    } catch {
      /* handled by parent */
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold mb-1 dark:text-white">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            className="w-full bg-gray-50 dark:bg-white/[0.07] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition dark:text-white dark:placeholder-gray-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1 dark:text-white">File Type</label>
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="w-full bg-gray-50 dark:bg-white/[0.07] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition dark:text-white"
          >
            {FILE_TYPES.map((ft) => (
              <option key={ft.value} value={ft.value}>
                {ft.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1 dark:text-white">File URL</label>
        <input
          type="url"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="https://res.cloudinary.com/..."
          className="w-full bg-gray-50 dark:bg-white/[0.07] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition dark:text-white dark:placeholder-gray-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1 dark:text-white">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your note..."
          rows={2}
          className="w-full bg-gray-50 dark:bg-white/[0.07] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition resize-none dark:text-white dark:placeholder-gray-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1 dark:text-white">
          Academic Hierarchy <span className="text-red-500">*</span>
        </label>
        <HierarchySelector
          selected={hierarchy}
          onChange={(h) => { setHierarchy(h); setHierarchyError(""); }}
        />
        {hierarchyError && (
          <p className="text-xs text-red-500 mt-1">{hierarchyError}</p>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !title.trim() || !hierarchy.subjectId}
          className="flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50"
        >
          {submitting ? (
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
  );
}
