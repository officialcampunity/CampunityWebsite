"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { useSocket } from "@/lib/socket-context";
import ConversationList from "@/components/ConversationList";
import ChatWindow from "@/components/ChatWindow";
import { LuMessageSquare } from "react-icons/lu";

interface ConversationUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

function MessagesContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { open } = useAuthModal();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<ConversationUser | null>(null);

  const { chatSocket } = useSocket();

  function handleSelectConversation(convId: string, convUser?: ConversationUser) {
    setSelectedConvId(convId);
    if (convUser) {
      setOtherUser(convUser);
    }
    if (chatSocket?.connected && convUser) {
      chatSocket.emit("markRead", { conversationId: convId, userId: convUser.id });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-4 animate-fadeIn">
        <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/10 p-12 text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
            <LuMessageSquare size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold mb-1 dark:text-white">Sign in to message others</h3>
          <p className="text-sm text-gray-400 mb-4">Connect with fellow students.</p>
          <button onClick={() => open("login")} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 animate-fadeIn">
      <div className="mb-5">
        <h1 className="text-2xl font-bold dark:text-white mb-1">Messages</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Chat with fellow students
        </p>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/10 overflow-hidden min-h-[calc(100vh-16rem)] flex flex-col md:flex-row">
        <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/10 flex-shrink-0 ${selectedConvId ? 'hidden md:block' : 'block'}`}>
          <div className="p-4">
            <ConversationList
              selectedId={selectedConvId ?? undefined}
              onSelectConversation={handleSelectConversation}
            />
          </div>
        </div>

        <div className={`flex-1 flex flex-col ${selectedConvId ? 'flex' : 'hidden'} md:flex min-h-[400px]`}>
          {selectedConvId && otherUser ? (
            <ChatWindow
              conversationId={selectedConvId}
              otherUser={otherUser}
              currentUserId={user.id}
              onBack={() => {
                setSelectedConvId(null);
                setOtherUser(null);
              }}
            />
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="text-center px-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                  <LuMessageSquare size={36} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold mb-1 dark:text-white">Select a conversation</h3>
                <p className="text-sm text-gray-400">
                  Choose a conversation from the left panel to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return <MessagesContent />;
}
