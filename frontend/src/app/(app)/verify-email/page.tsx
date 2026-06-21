"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LuCheck, LuCircleAlert, LuLoader } from "react-icons/lu";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/auth/verify-email`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
            credentials: "include",
          }
        );
        if (res.ok) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
        } else {
          const data = await res.json();
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      } catch {
        setStatus("error");
        setMessage("Network error. Please try again.");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/10 p-8 text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
              <LuLoader size={28} className="text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-bold dark:text-white">Verifying your email...</h3>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
              <LuCheck size={28} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold dark:text-white mb-1">Email verified!</h3>
            <p className="text-sm text-gray-400 mb-6">{message}</p>
            <Link href="/dashboard" className="text-sm font-bold text-primary hover:underline">
              Go to dashboard
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <LuCircleAlert size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold dark:text-white mb-1">Verification failed</h3>
            <p className="text-sm text-gray-400 mb-6">{message}</p>
            <Link href="/dashboard" className="text-sm font-bold text-primary hover:underline">
              Back to dashboard
            </Link>
          </>
        )}
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
