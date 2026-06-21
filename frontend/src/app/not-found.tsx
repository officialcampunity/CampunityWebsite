import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-[12rem] font-black leading-none text-black dark:text-white tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold mt-4 mb-2 dark:text-white">Page not found</h2>
        <p className="text-gray-500 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-3 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
