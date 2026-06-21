"use client";

import { useState } from "react";
import Link from "next/link";
import { LuMail, LuCircleAlert, LuCheck, LuArrowLeft } from "react-icons/lu";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          credentials: "include",
        }
      );
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-4 animate-fadeIn">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/10 p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <LuMail size={24} className="text-primary" />
            </div>
            <h1 className="text-xl font-bold dark:text-white mb-1">Forgot password?</h1>
            <p className="text-sm text-gray-400">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                <LuCheck size={28} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold dark:text-white mb-1">Check your inbox</h3>
              <p className="text-sm text-gray-400 mb-6">
                If an account exists for {email}, we&apos;ve sent a password reset link.
              </p>
              <Link
                href="/login"
                className="text-sm font-bold text-primary hover:underline"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-xl">
                  <LuCircleAlert size={14} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={sending || !email.trim()}
                className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 text-sm"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                <LuArrowLeft size={12} />
                Back to dashboard
              </Link>
            </form>
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
