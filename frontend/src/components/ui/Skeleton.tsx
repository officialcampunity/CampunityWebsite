"use client";

import React from "react";

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-gray-200 dark:bg-white/10 animate-pulse rounded-2xl ${className}`}
    />
  );
}

function SkeletonCircle({ size = "w-10 h-10", className = "" }: { size?: string; className?: string }) {
  return (
    <div
      className={`${size} bg-gray-200 dark:bg-white/10 animate-pulse rounded-full flex-shrink-0 ${className}`}
    />
  );
}

function SkeletonText({ width = "w-24", className = "" }: { width?: string; className?: string }) {
  return (
    <div
      className={`h-3 bg-gray-200 dark:bg-white/10 animate-pulse rounded ${width} ${className}`}
    />
  );
}

function SkeletonCard({ className = "", children, ...props }: { className?: string; children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      className={`bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/10 animate-pulse ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function SkeletonFeedCard() {
  return (
    <SkeletonCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonCircle size="w-10 h-10" />
        <div className="flex-1 space-y-1.5">
          <SkeletonText width="w-24" className="!h-4" />
          <SkeletonText width="w-16" className="!h-3" />
        </div>
      </div>
      <SkeletonText width="w-3/4" className="!h-5 mb-2" />
      <SkeletonText width="w-full" className="!h-4 mb-1" />
      <SkeletonText width="w-2/3" className="!h-4 mb-4" />
      <SkeletonBox className="!h-48 w-full mb-4" />
      <div className="flex gap-4">
        <SkeletonText width="w-12" className="!h-5" />
        <SkeletonText width="w-12" className="!h-5" />
      </div>
    </SkeletonCard>
  );
}

export function SkeletonProfileHeader() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <SkeletonBox className="!h-48 w-full !rounded-none" />
      <div className="max-w-4xl mx-auto px-4 -mt-20">
        <SkeletonCard className="p-8">
          <div className="flex flex-col items-center">
            <SkeletonCircle size="w-32 h-32" className="mb-4" />
            <SkeletonText width="w-48" className="!h-6 mb-2" />
            <SkeletonText width="w-32" className="!h-4 mb-4" />
            <SkeletonText width="w-64" className="!h-4 mb-6" />
            <div className="flex gap-8 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <SkeletonText width="w-12" className="!h-6 mb-1 mx-auto" />
                  <SkeletonText width="w-16" className="!h-3 mx-auto" />
                </div>
              ))}
            </div>
            <SkeletonBox className="!h-10 !w-32 !rounded-full" />
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
}

export function SkeletonUserRow() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <SkeletonCircle size="w-10 h-10" />
      <div className="flex-1 space-y-1.5">
        <SkeletonText width="w-24" className="!h-4" />
        <SkeletonText width="w-16" className="!h-3" />
      </div>
      <SkeletonBox className="!h-7 !w-20 !rounded-full" />
    </div>
  );
}

export function SkeletonCommentRow() {
  return (
    <div className="flex gap-3 animate-pulse">
      <SkeletonCircle size="w-8 h-8" />
      <div className="flex-1 space-y-1.5">
        <SkeletonText width="w-20" className="!h-3" />
        <SkeletonText width="w-full" className="!h-4" />
        <SkeletonText width="w-16" className="!h-3" />
      </div>
    </div>
  );
}

export function SkeletonMessageBubble({ align = "left" }: { align?: "left" | "right" }) {
  const width = align === "left" ? "w-40" : "w-32";
  return (
    <div className={`flex ${align === "right" ? "justify-end" : "justify-start"} animate-pulse`}>
      <SkeletonBox className={`!h-10 ${width} !rounded-2xl`} />
    </div>
  );
}

export function SkeletonNoteDetail() {
  return (
    <div className="space-y-4 w-full max-w-2xl px-4">
      <SkeletonCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <SkeletonCircle size="w-12 h-12" />
          <div className="space-y-1.5">
            <SkeletonText width="w-32" className="!h-4" />
            <SkeletonText width="w-20" className="!h-3" />
          </div>
        </div>
        <SkeletonText width="w-3/4" className="!h-8 mb-3" />
        <SkeletonText width="w-full" className="!h-4 mb-2" />
        <SkeletonText width="w-2/3" className="!h-4 mb-6" />
        <SkeletonBox className="!h-64 w-full mb-6" />
        <SkeletonBox className="!h-10 !w-24 !rounded-full" />
      </SkeletonCard>
      <SkeletonCard className="p-6">
        {[1, 2, 3].map((i) => (
          <SkeletonCommentRow key={i} />
        ))}
      </SkeletonCard>
    </div>
  );
}

export function SkeletonSearchResult() {
  return (
    <SkeletonCard className="p-6" style={{ animationDelay: "100ms", animationFillMode: "backwards" }}>
      <div className="flex items-center gap-3 mb-4">
        <SkeletonCircle size="w-10 h-10" />
        <div className="flex-1 space-y-1.5">
          <SkeletonText width="w-24" className="!h-4" />
          <SkeletonText width="w-16" className="!h-3" />
        </div>
      </div>
      <SkeletonText width="w-3/4" className="!h-5 mb-2" />
      <SkeletonText width="w-full" className="!h-4 mb-1" />
      <SkeletonText width="w-2/3" className="!h-4" />
    </SkeletonCard>
  );
}

export function SkeletonConversationItem() {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      <SkeletonCircle size="w-12 h-12" />
      <div className="flex-1 space-y-1.5">
        <SkeletonText width="w-24" className="!h-3" />
        <SkeletonText width="w-32" className="!h-2" />
      </div>
    </div>
  );
}

export function SkeletonTrendingCard() {
  return (
    <SkeletonCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonCircle size="w-10 h-10" />
        <div className="flex-1 space-y-1.5">
          <SkeletonText width="w-24" className="!h-4" />
          <SkeletonText width="w-16" className="!h-3" />
        </div>
      </div>
      <SkeletonText width="w-3/4" className="!h-5 mb-2" />
      <SkeletonText width="w-full" className="!h-4 mb-1" />
      <SkeletonText width="w-2/3" className="!h-4" />
    </SkeletonCard>
  );
}

export function Spinner({ size = "w-5 h-5", className = "" }: { size?: string; className?: string }) {
  return (
    <svg className={`${size} animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
