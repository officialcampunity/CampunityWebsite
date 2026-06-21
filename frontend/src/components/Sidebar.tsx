"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthModal } from "@/lib/auth-modal-context";
import { useSocket } from "@/lib/socket-context";
import { api } from "@/lib/api";
import {
  LuGrid3X3, LuSearch, LuCompass, LuZap, LuFileText,
  LuBookmark, LuMessageSquare, LuBell, LuSettings, LuLogOut, LuShield,
} from "react-icons/lu";


import type { User } from "@/lib/types";

interface SidebarProps {
  user?: Pick<User, 'id' | 'displayName' | 'username' | 'avatarUrl'> & { role?: string } | null;
  onUploadClick?: () => void;
  onLogout?: () => void;
}

export default function Sidebar({ user, onUploadClick, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const { open } = useAuthModal();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const { chatSocket, notificationSocket } = useSocket();

  useEffect(() => {
    if (user) {
      api.getUnreadMessageCount().then((res) => setUnreadCount(res.count)).catch(() => {});
      api.getNotifications(1).then((res) => {
        setUnreadNotifCount(res.data.filter((n: any) => !n.read).length);
      }).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!chatSocket) return;
    const handleUnreadUpdate = (data: { count: number }) => setUnreadCount(data.count);
    chatSocket.on("unreadUpdate", handleUnreadUpdate);
    return () => { chatSocket.off("unreadUpdate", handleUnreadUpdate); };
  }, [chatSocket]);

  useEffect(() => {
    if (!notificationSocket) return;
    const handleNotification = () => {
      setUnreadNotifCount((prev) => prev + 1);
    };
    notificationSocket.on("notification", handleNotification);
    return () => { notificationSocket.off("notification", handleNotification); };
  }, [notificationSocket]);

  const isActive = (path: string) => pathname === path;

  const mainLinks: { href: string; label: string; icon: React.FC<{ active?: boolean }>; authRequired: boolean; badge?: number }[] = [
    { href: "/dashboard", label: "Feed", icon: HomeIcon, authRequired: false },
    { href: "/explore", label: "Explore", icon: ExploreIcon, authRequired: false },
    { href: "/discover", label: "Discover", icon: DiscoverIcon, authRequired: false },
    { href: "/search", label: "Search", icon: SearchIcon, authRequired: false },
    { href: "/messages", label: "Messages", icon: MessagesIcon, authRequired: true, badge: unreadCount },
    { href: "/my-notes", label: "My Notes", icon: NotesIcon, authRequired: true },
    { href: "/bookmarks", label: "Bookmarks", icon: BookmarkIcon, authRequired: true },
    { href: "/notifications", label: "Notifications", icon: BellIcon, authRequired: true, badge: unreadNotifCount },
    { href: "/settings", label: "Settings", icon: SettingsIcon, authRequired: false },
    ...(user?.role === 'admin' || user?.role === 'superadmin'
      ? [{ href: "/admin", label: "Admin", icon: ShieldIcon, authRequired: true } as const]
      : []),
  ];

  const filteredLinks = mainLinks.filter((l) => !l.authRequired || user);

  const sidebarContent = (closeDrawer?: () => void) => (
    <>
      <Link
        href="/dashboard"
        onClick={closeDrawer}
        className="flex items-center gap-2 mb-6"
      >
        <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center transition-all duration-300">
          <span className="text-white font-bold text-sm">C</span>
        </span>
        <span className="text-lg font-bold tracking-tight dark:text-white">Campunity</span>
      </Link>

      {!user && (
        <div className="mb-6">
          <button
            onClick={() => { open("register"); closeDrawer?.(); }}
            className="w-full py-2.5 text-sm font-bold text-black border border-gray-300 rounded-full hover:bg-gray-50 dark:text-white dark:border-white/30 dark:hover:bg-white/10 transition-all duration-300 ease-out active:scale-[0.97]"
          >
            Get Started
          </button>
        </div>
      )}

      <nav className="space-y-1 flex-1">
        {filteredLinks.map((link) => {
          const isAct = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeDrawer}
              className={`flex items-center gap-4 px-5 py-3.5 text-[15px] font-bold rounded-[20px] transition-all duration-300 ease-out relative active:scale-[0.97] ${
                isAct
                  ? "bg-primary text-white dark:bg-primary dark:text-white shadow-sm"
                  : "text-gray-600 hover:text-primary hover:bg-primary/5 dark:text-gray-400 dark:hover:text-primary dark:hover:bg-primary/10"
              }`}
            >
              <link.icon active={isAct} />
              {link.label}
              {!!link.badge && link.badge > 0 && (
                <span className={`absolute right-4 w-6 h-6 rounded-full text-[11px] flex items-center justify-center font-bold ${isAct ? "bg-white text-primary" : "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary"}`}>
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/10">
          <Link
            href={`/profile/${user.id}`}
            onClick={closeDrawer}
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={user.displayName} width={36} height={36} className="w-full h-full object-cover" />
              ) : (
                user.displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate dark:text-white group-hover:text-primary transition">{user.displayName}</p>
              <p className="text-xs text-gray-400 truncate">@{user.username}</p>
            </div>
            <button
              onClick={(e) => { e.preventDefault(); onLogout?.(); }}
              className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-50 dark:hover:bg-red-500/10"
              title="Logout"
            >
              <LuLogOut size={12} className="text-gray-400 group-hover:text-red-500" />
            </button>
          </Link>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="flex flex-col h-full">
          {sidebarContent()}
        </div>
      </aside>

      {/* Mobile bottom navigation - capsule style */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pointer-events-none">
        <div className="flex items-center justify-around h-14 max-w-[300px] mx-auto mb-8 bg-white dark:bg-dark-card rounded-full border border-gray-200 dark:border-white/10 px-2 pointer-events-auto">
          <MobileNavItem href="/dashboard" label="Home" active={isActive("/dashboard")}>
            <HomeIcon active={isActive("/dashboard")} />
          </MobileNavItem>
          <MobileNavItem href="/search" label="Search" active={isActive("/search")}>
            <SearchIcon active={isActive("/search")} />
          </MobileNavItem>
          <MobileNavItem href="/explore" label="Explore" active={isActive("/explore")}>
            <ExploreIcon active={isActive("/explore")} />
          </MobileNavItem>
          {user ? (
            <MobileNavItem href={`/profile/${user.id}`} label="Profile" active={pathname.startsWith("/profile/")}>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={user.displayName} width={24} height={24} className="w-full h-full object-cover" />
                ) : (
                  user.displayName.charAt(0).toUpperCase()
                )}
              </div>
            </MobileNavItem>
          ) : (
            <MobileNavItem onClick={() => open("register")} label="Join" active={false}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </MobileNavItem>
          )}
          <MobileNavItem onClick={() => setMenuOpen(true)} label="Menu" active={false}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </MobileNavItem>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div
            className="absolute left-0 bottom-0 right-0 max-h-[85vh] bg-white dark:bg-dark-surface rounded-t-3xl overflow-y-auto"
            style={{ animation: "slideUp 0.25s ease-out" }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white font-bold text-sm">C</span>
                  </span>
                  <span className="text-lg font-bold tracking-tight dark:text-white">Campunity</span>
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center dark:text-white"
                  aria-label="Close menu"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {user && (
                <Link
                  href={`/profile/${user.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 mb-5"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                    {user.avatarUrl ? (
                      <Image src={user.avatarUrl} alt={user.displayName} width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      user.displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm dark:text-white truncate">{user.displayName}</p>
                    <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-300">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              )}

              {!user && (
                <div className="mb-5">
                  <button
                    onClick={() => { open("register"); setMenuOpen(false); }}
                    className="w-full py-2.5 text-sm font-bold text-black border border-gray-300 rounded-full hover:bg-gray-50 dark:text-white dark:border-white/30 dark:hover:bg-white/10"
                  >
                    Get Started
                  </button>
                </div>
              )}

              <nav className="space-y-1">
                {filteredLinks.map((link) => {
                  const isAct = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 text-[15px] font-bold rounded-[20px] transition-all duration-300 ease-out ${
                        isAct
                          ? "bg-primary text-white dark:bg-primary dark:text-white shadow-sm"
                          : "text-gray-600 hover:text-primary hover:bg-primary/5 dark:text-gray-400 dark:hover:text-primary dark:hover:bg-primary/10"
                      }`}
                    >
                      <link.icon active={isAct} />
                      {link.label}
                      {!!link.badge && link.badge > 0 && (
                        <span className={`ml-auto w-6 h-6 rounded-full text-[11px] flex items-center justify-center font-bold ${isAct ? "bg-white text-primary" : "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary"}`}>
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {user && (
                <div className="mt-4 space-y-1 border-t border-gray-200 dark:border-white/10 pt-4">
                  <button
                    onClick={onUploadClick}
                    className="flex items-center gap-4 px-4 py-3 w-full text-[15px] font-bold rounded-[20px] text-gray-600 hover:text-black hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 text-left"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    Upload
                  </button>

                  {onLogout && (
                    <button
                      onClick={() => { onLogout(); setMenuOpen(false); }}
                      className="flex items-center gap-4 px-4 py-3 w-full text-[15px] font-bold rounded-[20px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-left"
                    >
                      <LogoutIcon />
                      Logout
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

    </>
  );
}

function MobileNavItem({ href, onClick, label, active, children }: {
  href?: string;
  onClick?: () => void;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  const className = `flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition ${
    active ? "text-primary" : "text-gray-400"
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
        <span className="text-[10px] font-medium">{label}</span>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function HomeIcon({ active }: { active?: boolean }) {
  return <LuGrid3X3 size={22} className={active ? "text-white" : "text-gray-600 dark:text-gray-400"} />;
}

function SearchIcon({ active }: { active?: boolean }) {
  return <LuSearch size={18} className={active ? "text-white" : "text-gray-600 dark:text-gray-400"} />;
}

function ExploreIcon({ active }: { active?: boolean }) {
  return <LuCompass size={22} className={active ? "text-white" : "text-gray-600 dark:text-gray-400"} />;
}

function DiscoverIcon({ active }: { active?: boolean }) {
  return <LuZap size={20} className={active ? "text-white" : "text-gray-600 dark:text-gray-400"} />;
}

function NotesIcon({ active }: { active?: boolean }) {
  return <LuFileText size={20} className={active ? "text-white" : "text-gray-600 dark:text-gray-400"} />;
}

function BookmarkIcon({ active }: { active?: boolean }) {
  return <LuBookmark size={20} className={active ? "text-white" : "text-gray-600 dark:text-gray-400"} />;
}

function MessagesIcon({ active }: { active?: boolean }) {
  return <LuMessageSquare size={22} className={active ? "text-white" : "text-gray-600 dark:text-gray-400"} />;
}

function BellIcon({ active }: { active?: boolean }) {
  return <LuBell size={20} className={active ? "text-white" : "text-gray-600 dark:text-gray-400"} />;
}

function SettingsIcon({ active }: { active?: boolean }) {
  return <LuSettings size={20} className={active ? "text-white" : "text-gray-600 dark:text-gray-400"} />;
}

function ShieldIcon({ active }: { active?: boolean }) {
  return <LuShield size={20} className={active ? "text-white" : "text-gray-600 dark:text-gray-400"} />;
}

function LogoutIcon() {
  return <LuLogOut size={18} className="text-gray-600 dark:text-gray-400" />;
}
