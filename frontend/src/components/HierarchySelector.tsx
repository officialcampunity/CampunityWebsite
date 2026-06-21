"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface HierarchySelection {
  universityId: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
}

interface HierarchySelectorProps {
  selected: HierarchySelection;
  onChange: (selection: HierarchySelection) => void;
}

interface Option {
  id: string;
  name: string;
  code?: string;
}

export default function HierarchySelector({ selected, onChange }: HierarchySelectorProps) {
  const [universities, setUniversities] = useState<Option[]>([]);
  const [courses, setCourses] = useState<Option[]>([]);
  const [semesters, setSemesters] = useState<Option[]>([]);
  const [subjects, setSubjects] = useState<Option[]>([]);

  const [loadingUni, setLoadingUni] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [loadingSem, setLoadingSem] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);

  useEffect(() => {
    setLoadingUni(true);
    api.getUniversities()
      .then((data) => setUniversities(Array.isArray(data) ? data : []))
      .catch(() => setUniversities([]))
      .finally(() => setLoadingUni(false));
  }, []);

  useEffect(() => {
    if (!selected.universityId) {
      setCourses([]);
      return;
    }
    setLoadingCourse(true);
    api.getCourses(selected.universityId)
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourse(false));
  }, [selected.universityId]);

  useEffect(() => {
    if (!selected.courseId) {
      setSemesters([]);
      return;
    }
    setLoadingSem(true);
    api.getSemesters(selected.courseId)
      .then((data) => setSemesters(Array.isArray(data) ? data : []))
      .catch(() => setSemesters([]))
      .finally(() => setLoadingSem(false));
  }, [selected.courseId]);

  useEffect(() => {
    if (!selected.semesterId) {
      setSubjects([]);
      return;
    }
    setLoadingSub(true);
    api.getSubjects(selected.semesterId)
      .then((data) => setSubjects(Array.isArray(data) ? data : []))
      .catch(() => setSubjects([]))
      .finally(() => setLoadingSub(false));
  }, [selected.semesterId]);

  function update<K extends keyof HierarchySelection>(key: K, value: HierarchySelection[K]) {
    const next = { ...selected, [key]: value };
    if (key === "universityId") {
      next.courseId = "";
      next.semesterId = "";
      next.subjectId = "";
    } else if (key === "courseId") {
      next.semesterId = "";
      next.subjectId = "";
    } else if (key === "semesterId") {
      next.subjectId = "";
    }
    onChange(next);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <SelectField
        label="University"
        value={selected.universityId}
        options={universities}
        loading={loadingUni}
        placeholder="Select university..."
        onChange={(v) => update("universityId", v)}
      />

      <SelectField
        label="Course"
        value={selected.courseId}
        options={courses}
        loading={loadingCourse}
        placeholder={selected.universityId ? "Select course..." : "Select university first"}
        disabled={!selected.universityId}
        onChange={(v) => update("courseId", v)}
      />

      <SelectField
        label="Semester"
        value={selected.semesterId}
        options={semesters}
        loading={loadingSem}
        placeholder={selected.courseId ? "Select semester..." : "Select course first"}
        disabled={!selected.courseId}
        onChange={(v) => update("semesterId", v)}
      />

      <SelectField
        label="Subject"
        value={selected.subjectId}
        options={subjects}
        loading={loadingSub}
        placeholder={selected.semesterId ? "Select subject..." : "Select semester first"}
        disabled={!selected.semesterId}
        onChange={(v) => update("subjectId", v)}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  loading,
  placeholder,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  loading: boolean;
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          disabled={disabled || loading}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-50 dark:bg-white/[0.07] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition disabled:opacity-50 disabled:cursor-not-allowed appearance-none dark:text-white"
        >
          <option value="">{loading ? "Loading..." : placeholder}</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
