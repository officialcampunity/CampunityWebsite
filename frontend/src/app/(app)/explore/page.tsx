"use client";

import { useState, useEffect } from "react";
import Feed from "@/components/Feed";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  LuBuilding,
  LuBookOpen,
  LuCalendar,
  LuBookMarked,
  LuRotateCcw,
  LuSearch,
} from "react-icons/lu";
import DropdownSection from "@/components/DropdownSection";

interface FilterState {
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

export default function ExplorePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [universities, setUniversities] = useState<SectionItem[]>([]);
  const [courses, setCourses] = useState<SectionItem[]>([]);
  const [semesters, setSemesters] = useState<SectionItem[]>([]);
  const [subjects, setSubjects] = useState<SectionItem[]>([]);

  const [loadingUni, setLoadingUni] = useState(true);
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [loadingSem, setLoadingSem] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);

  const [sel, setSel] = useState<FilterState>({
    universityId: "", universityName: "",
    courseId: "", courseName: "",
    semesterId: "", semesterName: "",
    subjectId: "", subjectName: "",
  });

  const [feedKey, setFeedKey] = useState(0);

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

  function handleSelect(level: string, id: string, name: string) {
    setSel((p) => {
      const base = { ...p };
      if (level === "university") {
        base.universityId = id;
        base.universityName = name;
        base.courseId = "";
        base.courseName = "";
        base.semesterId = "";
        base.semesterName = "";
        base.subjectId = "";
        base.subjectName = "";
      } else if (level === "course") {
        base.courseId = id;
        base.courseName = name;
        base.semesterId = "";
        base.semesterName = "";
        base.subjectId = "";
        base.subjectName = "";
      } else if (level === "semester") {
        base.semesterId = id;
        base.semesterName = name;
        base.subjectId = "";
        base.subjectName = "";
      } else if (level === "subject") {
        base.subjectId = id;
        base.subjectName = name;
      }
      return base;
    });
    setFeedKey((k) => k + 1);
  }

  function clearAll() {
    setSel({ universityId: "", universityName: "", courseId: "", courseName: "", semesterId: "", semesterName: "", subjectId: "", subjectName: "" });
    setFeedKey((k) => k + 1);
  }

  const hierarchy = sel.subjectId
    ? { subjectId: sel.subjectId }
    : sel.semesterId
    ? { semesterId: sel.semesterId }
    : sel.courseId
    ? { courseId: sel.courseId }
    : sel.universityId
    ? { universityId: sel.universityId }
    : undefined;

  const hasSelection = !!sel.universityId || !!sel.courseId || !!sel.semesterId || !!sel.subjectId;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  const dropdownStates = [
    {
      section: SECTIONS[0],
      items: universities,
      value: sel.universityId,
      loading: loadingUni,
      disabled: false,
      onChange: (id: string, name: string) => handleSelect("university", id, name),
    },
    {
      section: SECTIONS[1],
      items: courses,
      value: sel.courseId,
      loading: loadingCourse,
      disabled: !sel.universityId,
      onChange: (id: string, name: string) => handleSelect("course", id, name),
    },
    {
      section: SECTIONS[2],
      items: semesters,
      value: sel.semesterId,
      loading: loadingSem,
      disabled: !sel.courseId,
      onChange: (id: string, name: string) => handleSelect("semester", id, name),
    },
    {
      section: SECTIONS[3],
      items: subjects,
      value: sel.subjectId,
      loading: loadingSub,
      disabled: !sel.semesterId,
      onChange: (id: string, name: string) => handleSelect("subject", id, name),
    },
  ];

  return (
    <div className="py-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold dark:text-white mb-1">Explore</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select from the sections below to find notes
          </p>
        </div>
        {hasSelection && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 transition px-3 py-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LuRotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} className="relative mb-5">
        <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes, users, courses..."
          className="w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition dark:text-white dark:placeholder-gray-500"
        />
      </form>

      <div className="flex flex-wrap gap-3 mb-6">
        {dropdownStates.map((ds) => (
          <div key={ds.section.key} className="flex-1 min-w-0 basis-40">
            <DropdownSection {...ds} />
          </div>
        ))}
      </div>

      <div className="flex-1 min-w-0">
        {hasSelection ? (
          <Feed key={feedKey} hierarchy={hierarchy} />
        ) : (
          <div className="bg-white dark:bg-dark-card rounded-3xl p-12 border border-gray-100 dark:border-white/10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
              <LuSearch size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold mb-1 dark:text-white">Find Study Resources</h3>
            <p className="text-sm text-gray-400">
              Select a university to start browsing notes
            </p>
          </div>
        )}
      </div>

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
