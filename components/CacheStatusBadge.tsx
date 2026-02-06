"use client";

import { cn } from "@/lib/utils";

interface CacheStatusBadgeProps {
  cacheDaysAgo: number;
  onRefresh: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function CacheStatusBadge({
  cacheDaysAgo,
  onRefresh,
  isRefreshing = false,
  className,
}: CacheStatusBadgeProps) {
  const getCacheText = () => {
    if (cacheDaysAgo === 0) return "Cached today";
    if (cacheDaysAgo === 1) return "Cached 1 day ago";
    return `Cached ${cacheDaysAgo} days ago`;
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs text-primary-700",
        className
      )}
    >
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
      <span>{getCacheText()}</span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className={cn(
          "rounded-full p-0.5 transition-colors",
          "hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
        title="Refresh data"
      >
        <svg
          className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  );
}
