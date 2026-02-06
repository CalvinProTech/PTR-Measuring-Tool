"use client";

import { useEffect } from "react";
import type { BulletinData } from "@/types";

interface BulletinDetailModalProps {
  bulletin: BulletinData | null;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function renderContent(content: string): string {
  const escaped = escapeHtml(content);
  return escaped
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(
      /\[(.*?)\]\((.*?)\)/g,
      (_match, text, url) => {
        if (!isValidUrl(url)) return text;
        return `<a href="${url}" class="text-primary-600 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
    )
    .replace(/^- (.*)$/gm, "<li class='ml-4'>$1</li>")
    .replace(/\n/g, "<br>");
}

export function BulletinDetailModal({
  bulletin,
  onClose,
  onMarkAsRead,
}: BulletinDetailModalProps) {
  // Mark as read when modal opens
  useEffect(() => {
    if (bulletin && !bulletin.isRead) {
      onMarkAsRead(bulletin.id);
    }
  }, [bulletin, onMarkAsRead]);

  if (!bulletin) return null;

  const formattedDate = new Date(bulletin.publishDate).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="bulletin-detail-title">
      <div
        className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform rounded-xl bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 id="bulletin-detail-title" className="text-lg font-semibold text-gray-900">
                  {bulletin.title}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{formattedDate}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close bulletin"
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: renderContent(bulletin.content) }}
            />
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4">
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
