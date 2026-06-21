"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LuCircleAlert, LuCheck, LuEye, LuEyeOff } from "react-icons/lu";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setResetting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
          credentials: "include",
        }
      );
      if (res.ok) {
        setDone(true);
      } else {
        const data = await res.json();
        setError(data.message || "Invalid or expired reset link.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResetting(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-4 animate-fadeIn">
        <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/10 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <LuCircleAlert size={28} className="text-red-500" />
          </div>
          <h3 className="text-lg font-bold dark:text-white mb-1">Invalid reset link</h3>
          <p className="text-sm text-gray-400 mb-6">This link is invalid or has expired.</p>
          <Link href="/forgot-password" className="text-sm font-bold text-primary hover:underline">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-4 animate-fadeIn">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/10 p-8">
          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                <LuCheck size={28} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold dark:text-white mb-1">Password reset!</h3>
              <p className="text-sm text-gray-400 mb-6">Your password has been updated successfully.</p>
              <Link href="/dashboard" className="text-sm font-bold text-primary hover:underline">
                Go to dashboard
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold dark:text-white mb-1 text-center">Reset your password</h1>
              <p className="text-sm text-gray-400 mb-6 text-center">Enter your new password below.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    required
                    minLength={6}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 pr-11 text-sm outline-none dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 pr-11 text-sm outline-none dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirm ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-xl">
                    <LuCircleAlert size={14} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetting || !password || !confirmPassword}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 text-sm"
                >
                  {resetting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
}
