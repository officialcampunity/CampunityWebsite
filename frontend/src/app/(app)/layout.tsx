"use client";

import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AuthModalProvider } from "@/lib/auth-modal-context";
import { SocketProvider } from "@/lib/socket-context";
import { ToastProvider } from "@/lib/toast-context";
import Sidebar from "@/components/Sidebar";
import AuthModal from "@/components/AuthModal";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="h-screen bg-white dark:bg-dark-bg flex p-6 gap-6 overflow-hidden transition-colors duration-300">
      <Sidebar
        user={user ? { id: user.id, displayName: user.displayName, username: user.username, avatarUrl: user.avatarUrl, role: user.role } : null}
        onUploadClick={() => router.push('/upload')}
        onLogout={logout}
      />
      <main className="flex-1 min-w-0 overflow-y-auto scrollbar-hide">{children}</main>
      <AuthModal />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SocketProvider>
        <AuthModalProvider>
          <ToastProvider>
            <AppLayoutContent>{children}</AppLayoutContent>
          </ToastProvider>
        </AuthModalProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
