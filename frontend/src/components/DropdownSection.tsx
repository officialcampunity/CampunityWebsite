"use client";

import { LuChevronDown } from "react-icons/lu";

interface SectionItem {
  id: string;
  name: string;
}

interface SectionDef {
  key: string;
  title: string;
  icon: React.ReactNode;
  placeholder: string;
}

export default function DropdownSection({
  section, items, value, loading, disabled, onChange,
}: {
  section: SectionDef;
  items: SectionItem[];
  value: string;
  loading: boolean;
  disabled: boolean;
  onChange: (id: string, name: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden transition-all duration-300">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
        <span className="text-gray-400">{section.icon}</span>
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">
          {section.title}
        </h3>
      </div>
      <div className="p-2">
        <div className="relative">
          <select
            value={value}
            disabled={disabled || loading}
            onChange={(e) => {
              const opt = e.target.selectedOptions[0];
              onChange(opt && opt.value ? opt.value : "", opt?.text || "");
            }}
            className={`
              w-full appearance-none px-2.5 py-2 pr-8 rounded-lg text-xs font-medium
              border transition-all duration-200 outline-none
              ${disabled
                ? "bg-gray-50 dark:bg-white/5 text-gray-300 dark:text-gray-600 border-gray-100 dark:border-white/5 cursor-not-allowed"
                : value
                ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary border-primary/30"
                : "bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 cursor-pointer"
              }
            `}
          >
            <option value="" disabled>
              {loading ? "Loading..." : section.placeholder}
            </option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <LuChevronDown
              size={12}
              className={`transition-colors duration-200 ${
                disabled ? "text-gray-300 dark:text-gray-600" : value ? "text-primary" : "text-gray-400"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
