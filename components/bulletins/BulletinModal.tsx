"use client";

import { useState, useEffect } from "react";
import type { BulletinData } from "@/types";

interface BulletinModalProps {
  isOpen: boolean;
  bulletin?: BulletinData | null;
  onClose: () => void;
  onSave: (input: { title: string; content: string; publishDate?: string }) => Promise<void>;
  isLoading: boolean;
}

function formatDateForInput(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function BulletinModal({
  isOpen,
  bulletin,
  onClose,
  onSave,
  isLoading,
}: BulletinModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [publishDate, setPublishDate] = useState(formatDateForInput(new Date()));
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!bulletin;

  // Reset form when modal opens/closes or bulletin changes
  useEffect(() => {
    if (isOpen) {
      if (bulletin) {
        setTitle(bulletin.title);
        setContent(bulletin.content);
        setPublishDate(formatDateForInput(new Date(bulletin.publishDate)));
      } else {
        setTitle("");
        setContent("");
        setPublishDate(formatDateForInput(new Date()));
      }
      setError(null);
    }
  }, [isOpen, bulletin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    try {
      // Parse date with noon time to avoid timezone shifts
      // "2026-02-06" + "T12:00:00" ensures the date stays correct in any timezone
      await onSave({
        title: title.trim(),
        content: content.trim(),
        publishDate: new Date(`${publishDate}T12:00:00`).toISOString(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save bulletin");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="bulletin-modal-title">
      <div
        className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform rounded-xl bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 id="bulletin-modal-title" className="text-lg font-semibold text-gray-900">
                {isEditing ? "Edit Bulletin" : "Create Bulletin"}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
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

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Bulletin title"
                />
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Write your bulletin content here..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Supports basic formatting: **bold**, [links](url), and - lists
                </p>
              </div>

              <div>
                <label
                  htmlFor="publishDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Publish Date
                </label>
                <input
                  type="date"
                  id="publishDate"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
