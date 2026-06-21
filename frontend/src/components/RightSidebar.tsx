"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { User } from "@/lib/types";
import { LuPlus } from "react-icons/lu";

function SuggestedUsers() {
  const { user: currentUser } = useAuth();
  const [suggested, setSuggested] = useState<User[]>([]);

  useEffect(() => {
    api.getSuggestedUsers().then(setSuggested).catch(() => {});
  }, []);

  if (suggested.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Suggested</h3>
      <div className="space-y-2">
        {suggested.map((u) => (
          <Link
            key={u.id}
            href={`/profile/${u.id}`}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition group"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary/40 to-primary flex-shrink-0">
              {u.avatarUrl ? (
                <Image src={u.avatarUrl} alt={u.displayName} width={32} height={32} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                  {u.displayName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold dark:text-white truncate">{u.displayName}</p>
              <p className="text-[11px] text-gray-400 truncate">@{u.username}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function RightSidebar() {
  return (
    <div className="p-3">
      <SuggestedUsers />
    </div>
  );
}
