"use client";

import { LuCircleAlert } from "react-icons/lu";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
              <LuCircleAlert size={36} className="text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2 dark:text-white">Something went wrong</h1>
            <p className="text-gray-500 mb-6">An unexpected error occurred. Please try again.</p>
            <button
              onClick={() => reset()}
              className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
