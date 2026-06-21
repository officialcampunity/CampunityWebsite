"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { useTheme, type ThemeMode } from "@/lib/theme-context";
import { api } from "@/lib/api";
import {
  LuUser,
  LuPalette,
  LuBell,
  LuShieldAlert,
  LuMonitor,
  LuMoon,
  LuSun,
  LuCamera,
  LuCheck,
  LuTrash2,
  LuMail,
  LuHeart,
  LuMessageCircle,
  LuUserPlus,
  LuSave,
  LuArchive,
  LuClock,
  LuPlay,
} from "react-icons/lu";

const TABS = [
  { key: "profile", label: "Profile", icon: LuUser, desc: "Manage your personal information" },
  { key: "appearance", label: "Appearance", icon: LuPalette, desc: "Customize the look and feel" },
  { key: "notifications", label: "Notifications", icon: LuBell, desc: "Configure your notification preferences" },
  { key: "archived", label: "Archived Stories", icon: LuArchive, desc: "View your expired stories" },
  { key: "danger", label: "Danger Zone", icon: LuShieldAlert, desc: "Irreversible account actions" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
        checked ? "bg-primary" : "bg-gray-200 dark:bg-white/20"
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/[0.07] border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition dark:text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

export default function SettingsPage() {
  const { user, loading, updateUser } = useAuth();
  const { open } = useAuthModal();
  const { mode, resolved, setMode } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archivedStories, setArchivedStories] = useState<import("@/lib/types").ArchivedStory[]>([]);
  const [archivedLoading, setArchivedLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "archived" && user) {
      setArchivedLoading(true);
      api.getArchivedStories()
        .then(setArchivedStories)
        .catch(() => {})
        .finally(() => setArchivedLoading(false));
    }
  }, [activeTab, user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      await updateUser({ displayName, bio, avatarUrl });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${API_BASE}/users/me`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        window.location.href = "/";
      }
    } catch {
      setError("Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/10 p-12 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
            <LuUser size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold mb-1 dark:text-white">
            Sign in to manage settings
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Customize your profile and preferences.
          </p>
          <button
            onClick={() => open("login")}
            className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const avatarInitial = user.displayName?.charAt(0).toUpperCase() || "U";

  return (
    <div className="py-4 animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold dark:text-white mb-1">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/10 rounded-2xl w-full sm:w-fit mb-8 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const isDanger = tab.key === "danger";
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? isDanger
                    ? "bg-red-500 text-white shadow-sm"
                    : "bg-white dark:bg-dark-card text-primary dark:text-primary shadow-sm"
                  : isDanger
                  ? "text-gray-500 dark:text-gray-400 hover:text-red-500"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="max-w-xl">
        {activeTab === "profile" && (
          <form onSubmit={handleSave}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden shadow-sm ring-2 ring-white dark:ring-0">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    alt={user.displayName}
                  />
                ) : (
                  avatarInitial
                )}
              </div>
              <div>
                <p className="font-bold text-lg dark:text-white">
                  {user.displayName}
                </p>
                <p className="text-sm text-gray-400">@{user.username}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Display Name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
                <Input
                  label="Username"
                  type="text"
                  value={user.username}
                  disabled
                />
              </div>

              <Input
                label="Bio"
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A short bio about yourself"
              />

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Avatar
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    id="avatar-upload"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        setError("File too large. Max 5 MB.");
                        return;
                      }
                      setSaving(true);
                      setError("");
                      try {
                        const formData = new FormData();
                        formData.append("avatar", file);
                        const res = await fetch(
                          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/users/me/avatar`,
                          { method: "POST", credentials: "include", body: formData }
                        );
                        if (res.ok) {
                          const data = await res.json();
                          setAvatarUrl(data.avatarUrl);
                          setSuccess(true);
                          setTimeout(() => setSuccess(false), 3000);
                        } else {
                          setError("Upload failed");
                        }
                      } catch {
                        setError("Network error");
                      } finally {
                        setSaving(false);
                      }
                    }}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/[0.07] border border-gray-200 dark:border-white/10 rounded-xl text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition dark:text-white"
                  >
                    <LuCamera size={15} />
                    {avatarUrl ? "Change photo" : "Upload photo"}
                  </label>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => { setAvatarUrl(""); }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                  <LuShieldAlert size={16} />
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                  <LuCheck size={16} />
                  Changes saved successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <LuSave size={15} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {activeTab === "appearance" && (
          <div>
            <h2 className="text-lg font-bold dark:text-white mb-1">
              Appearance
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Customize how Campunity looks for you
            </p>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/10">
              <p className="text-sm font-bold dark:text-white mb-3">Theme</p>
              <div className="flex gap-2">
                {([["system", "System", LuMonitor], ["light", "Light", LuSun], ["dark", "Dark", LuMoon]] as [ThemeMode, string, typeof LuMonitor][])
                  .map(([val, label, Icon]) => {
                    const active = mode === val;
                    return (
                      <button
                        key={val}
                        onClick={() => setMode(val)}
                        className={`flex-1 flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-semibold transition border ${
                          active
                            ? "bg-white dark:bg-dark-card border-primary text-primary shadow-sm"
                            : "bg-white dark:bg-dark-card border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/30"
                        }`}
                      >
                        <Icon size={18} />
                        {label}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            <h2 className="text-lg font-bold dark:text-white mb-1">
              Notifications
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Choose what notifications you want to receive
            </p>
            <div className="space-y-1">
              {[
                {
                  label: "Likes",
                  desc: "When someone likes your note",
                  icon: LuHeart,
                  color: "text-red-400",
                },
                {
                  label: "Comments",
                  desc: "When someone comments on your note",
                  icon: LuMessageCircle,
                  color: "text-blue-400",
                },
                {
                  label: "Follows",
                  desc: "When someone follows you",
                  icon: LuUserPlus,
                  color: "text-green-400",
                },
                {
                  label: "Messages",
                  desc: "When someone sends you a message",
                  icon: LuMail,
                  color: "text-primary",
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between p-4 rounded-2xl transition hover:bg-gray-50 dark:hover:bg-white/[0.04] ${
                      i < 3
                        ? "border-b border-gray-100 dark:border-white/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                        <Icon size={15} className={item.color} />
                      </div>
                      <div>
                        <p className="text-sm font-bold dark:text-white">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <Toggle checked={true} onChange={() => {}} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "archived" && (
          <div>
            <h2 className="text-lg font-bold dark:text-white mb-1">
              Archived Stories
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Stories that expired in the last 7 days
            </p>
            {archivedLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : archivedStories.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 dark:bg-white/[0.04] rounded-2xl border border-gray-100 dark:border-white/10">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                  <LuArchive size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium dark:text-white mb-1">No archived stories</p>
                <p className="text-xs text-gray-400">Expired stories will appear here for 7 days</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {archivedStories.map((s) => (
                  <div
                    key={s.id}
                    className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/10 group cursor-pointer"
                  >
                    {s.mediaType === "image" ? (
                      <img
                        src={s.mediaUrl}
                        alt={s.caption || "Archived story"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={s.mediaUrl}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <button
                        onClick={() => window.open(s.mediaUrl, "_blank")}
                        className="flex items-center gap-1 text-xs text-white font-semibold bg-black/40 rounded-full px-2.5 py-1 backdrop-blur-sm"
                      >
                        <LuPlay size={12} />
                        View
                      </button>
                    </div>
                    {s.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                        <p className="text-[11px] text-white font-medium truncate">
                          {s.caption}
                        </p>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                      <LuClock size={10} className="text-white/80" />
                      <span className="text-[10px] text-white/80 font-medium">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "danger" && (
          <div>
            <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">
              Danger Zone
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Irreversible account actions
            </p>
            <div className="p-5 rounded-2xl bg-red-50/50 dark:bg-red-500/[0.04] border border-red-100 dark:border-red-900/30">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <LuTrash2 size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">
                    Delete your account
                  </p>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    Permanently delete your account and all your data, including
                    notes, likes, comments, and messages. This action cannot be
                    undone.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-5 py-2 text-xs font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all duration-200 active:scale-[0.98] shadow-sm"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Delete account confirmation">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowDeleteModal(false)} aria-label="Close modal" />
          <div className="relative w-full max-w-md bg-white dark:bg-dark-card rounded-3xl p-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                <LuTrash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold dark:text-white mb-2">Delete your account?</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                This will permanently delete your account and all your data, including notes, likes, comments, and messages. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition disabled:opacity-50"
                aria-label="Cancel account deletion"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                aria-label="Confirm account deletion"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}