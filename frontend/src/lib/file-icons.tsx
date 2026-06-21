import {
  LuFileImage, LuVideo, LuMusic, LuFileText,
  LuFileArchive, LuFileCode, LuFile,
  LuLink, LuBookOpen,
} from "react-icons/lu";

export const FILE_ICONS: Record<string, React.ReactNode> = {
  Image: <LuFileImage size={20} />,
  Video: <LuVideo size={20} />,
  Audio: <LuMusic size={20} />,
  PDF: <LuFileText size={20} />,
  Document: <LuFileText size={20} />,
  Archive: <LuFileArchive size={20} />,
  Code: <LuFileCode size={20} />,
  File: <LuFile size={20} />,
  Note: <LuFileText size={16} />,
  "Past Paper": <LuBookOpen size={16} />,
  Link: <LuLink size={16} />,
};

export const TYPE_BG_COLORS: Record<string, string> = {
  Image: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Video: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
  Audio: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  PDF: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
  Document: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Archive: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400",
  Code: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  File: "bg-gray-50 dark:bg-white/10 text-gray-600 dark:text-gray-400",
  Note: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Past Paper": "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400",
  Link: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400",
};
