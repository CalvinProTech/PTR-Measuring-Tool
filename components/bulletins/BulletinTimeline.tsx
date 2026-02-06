"use client";

import { useMemo } from "react";
import { BulletinCard } from "./BulletinCard";
import type { BulletinData } from "@/types";

interface BulletinTimelineProps {
  bulletins: BulletinData[];
  currentMonth: Date;
  isOwner: boolean;
  onView: (bulletin: BulletinData) => void;
  onEdit?: (bulletin: BulletinData) => void;
  onDelete?: (bulletin: BulletinData) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

interface GroupedBulletins {
  date: Date;
  dateLabel: string;
  bulletins: BulletinData[];
}

function formatDayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return "Today";
  }

  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function BulletinTimeline({
  bulletins,
  currentMonth,
  isOwner,
  onView,
  onEdit,
  onDelete,
  onPreviousMonth,
  onNextMonth,
}: BulletinTimelineProps) {
  // Group bulletins by day
  const groupedBulletins = useMemo(() => {
    const groups = new Map<string, BulletinData[]>();

    // Sort bulletins by date descending
    const sorted = [...bulletins].sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

    sorted.forEach((bulletin) => {
      const date = new Date(bulletin.publishDate);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(bulletin);
    });

    // Convert to array of grouped bulletins
    const result: GroupedBulletins[] = [];
    groups.forEach((bulletins, key) => {
      const [year, month, day] = key.split("-").map(Number);
      const date = new Date(year, month, day);
      result.push({
        date,
        dateLabel: formatDayLabel(date),
        bulletins,
      });
    });

    return result;
  }, [bulletins]);

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Check if we're at the current month (can't go to future)
  const now = new Date();
  const isCurrentMonth =
    currentMonth.getFullYear() === now.getFullYear() &&
    currentMonth.getMonth() === now.getMonth();

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPreviousMonth}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h3 className="text-sm font-semibold text-gray-900">{monthLabel}</h3>
        <button
          onClick={onNextMonth}
          disabled={isCurrentMonth}
          className={`p-2 rounded-lg ${
            isCurrentMonth
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Timeline */}
      {groupedBulletins.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">
            No bulletins for {monthLabel}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedBulletins.map((group) => (
            <div key={group.date.toISOString()}>
              {/* Day header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-500" />
                <h4 className="text-sm font-medium text-gray-700">
                  {group.dateLabel}
                </h4>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Bulletins for this day */}
              <div className="ml-5 space-y-3">
                {group.bulletins.map((bulletin) => (
                  <BulletinCard
                    key={bulletin.id}
                    bulletin={bulletin}
                    isOwner={isOwner}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
