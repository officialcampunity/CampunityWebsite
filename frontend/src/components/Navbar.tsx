"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuthModal } from "@/lib/auth-modal-context";
import { useTheme, type ThemeMode } from "@/lib/theme-context";
import { LuSun, LuMoon, LuMonitor } from "react-icons/lu";

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

interface NavbarProps {
  user?: User | null;
  onLogout?: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const { open } = useAuthModal();
  const { mode, resolved, setMode } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeIcon = mode === "system" ? LuMonitor : mode === "dark" ? LuMoon : LuSun;
  const ThemeIcon = themeIcon;

  const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof LuSun }[] = [
    { value: "system", label: "System", icon: LuMonitor },
    { value: "light", label: "Light", icon: LuSun },
    { value: "dark", label: "Dark", icon: LuMoon },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-dark-bg/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
      <div className="max-w-[1500px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </span>
            <span className="text-lg font-bold tracking-tight dark:text-white">Campunity</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/dashboard" label="Feed" />
            {user && <NavLink href="/upload" label="Upload" />}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              aria-label="Theme"
              className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition"
            >
              <ThemeIcon size={18} />
            </button>
            {themeOpen && (
              <div className="absolute right-0 top-12 w-36 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/10 py-1.5 animate-in fade-in z-50">
                {THEME_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = mode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => { setMode(opt.value); setThemeOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition ${
                        active
                          ? "text-primary font-semibold"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10"
                      }`}
                    >
                      <Icon size={16} />
                      {opt.label}
                      {active && <span className="ml-auto text-primary">&#10003;</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                aria-label="User menu"
                className="flex items-center gap-2 hover:opacity-80 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/10 py-2 animate-in fade-in">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                    <p className="font-bold text-sm dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">@{user.username}</p>
                  </div>
                  <Link
                    href={`/profile/${user.id}`}
                    className="block px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-white/10 dark:text-white transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/messages"
                    className="block px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-white/10 dark:text-white transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Messages
                  </Link>
                  <div className="border-t border-gray-100 dark:border-white/10 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout?.();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => open("register")}
              className="px-5 py-2 text-sm font-bold text-black border border-gray-300 rounded-full hover:bg-gray-50 dark:text-white dark:border-white/30 dark:hover:bg-white/10 transition"
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10 rounded-full transition"
    >
      {label}
    </Link>
  );
}
