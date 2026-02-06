"use client";

import type { BulletinData } from "@/types";

interface BulletinCardProps {
  bulletin: BulletinData;
  isOwner: boolean;
  onView: (bulletin: BulletinData) => void;
  onEdit?: (bulletin: BulletinData) => void;
  onDelete?: (bulletin: BulletinData) => void;
}

export function BulletinCard({
  bulletin,
  isOwner,
  onView,
  onEdit,
  onDelete,
}: BulletinCardProps) {
  const formattedDate = new Date(bulletin.publishDate).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  // Truncate content for preview
  const preview =
    bulletin.content.length > 100
      ? bulletin.content.substring(0, 100) + "..."
      : bulletin.content;

  return (
    <div
      className={`relative rounded-lg border p-4 transition-colors ${
        bulletin.isRead
          ? "border-gray-200 bg-white"
          : "border-primary-200 bg-primary-50"
      }`}
    >
      {/* Unread indicator */}
      {!bulletin.isRead && (
        <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary-500" />
      )}

      <button
        onClick={() => onView(bulletin)}
        className="w-full text-left"
      >
        <h4 className="font-medium text-gray-900 pr-6">{bulletin.title}</h4>
        <p className="mt-1 text-sm text-gray-500">{preview}</p>
        <p className="mt-2 text-xs text-gray-400">{formattedDate}</p>
      </button>

      {isOwner && (
        <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
          <button
            onClick={() => onEdit?.(bulletin)}
            className="text-xs text-gray-500 hover:text-primary-600"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete?.(bulletin)}
            className="text-xs text-gray-500 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
