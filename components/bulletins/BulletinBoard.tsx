"use client";

import { useState, useCallback } from "react";
import { BulletinUnreadBadge } from "./BulletinUnreadBadge";
import { BulletinTimeline } from "./BulletinTimeline";
import { BulletinDetailModal } from "./BulletinDetailModal";
import { BulletinModal } from "./BulletinModal";
import { useBulletins } from "@/hooks/useBulletins";
import type { BulletinData } from "@/types";

interface BulletinBoardProps {
  isOwner: boolean;
}

export function BulletinBoard({ isOwner }: BulletinBoardProps) {
  const {
    bulletins,
    unreadCount,
    isLoading,
    selectedMonth,
    setSelectedMonth,
    createBulletin,
    updateBulletin,
    deleteBulletin,
    markAsRead,
    isCreating,
    isUpdating,
    isCollapsed,
    setIsCollapsed,
  } = useBulletins();

  const [viewingBulletin, setViewingBulletin] = useState<BulletinData | null>(
    null
  );
  const [editingBulletin, setEditingBulletin] = useState<BulletinData | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<BulletinData | null>(null);

  const handlePreviousMonth = useCallback(() => {
    setSelectedMonth(
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1)
    );
  }, [selectedMonth, setSelectedMonth]);

  const handleNextMonth = useCallback(() => {
    setSelectedMonth(
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1)
    );
  }, [selectedMonth, setSelectedMonth]);

  const handleCreateBulletin = useCallback(
    async (input: { title: string; content: string; publishDate?: string }) => {
      await createBulletin(input);
    },
    [createBulletin]
  );

  const handleUpdateBulletin = useCallback(
    async (input: { title?: string; content?: string; publishDate?: string }) => {
      if (editingBulletin) {
        await updateBulletin(editingBulletin.id, input);
        setEditingBulletin(null);
      }
    },
    [editingBulletin, updateBulletin]
  );

  const handleDeleteBulletin = useCallback(async () => {
    if (confirmDelete) {
      await deleteBulletin(confirmDelete.id);
      setConfirmDelete(null);
    }
  }, [confirmDelete, deleteBulletin]);

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-expanded={!isCollapsed}
        aria-controls="bulletin-board-content"
        className="w-full border-b border-gray-200 px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            className="h-5 w-5 text-primary-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">
            Company Bulletin Board
          </h2>
          <BulletinUnreadBadge count={unreadCount} />
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isCollapsed ? "" : "rotate-180"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Collapsible content */}
      {!isCollapsed && (
        <div id="bulletin-board-content" className="p-6">
          {/* Owner controls */}
          {isOwner && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Bulletin
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            </div>
          ) : (
            <BulletinTimeline
              bulletins={bulletins}
              currentMonth={selectedMonth}
              isOwner={isOwner}
              onView={setViewingBulletin}
              onEdit={setEditingBulletin}
              onDelete={setConfirmDelete}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
            />
          )}
        </div>
      )}

      {/* View bulletin modal */}
      <BulletinDetailModal
        bulletin={viewingBulletin}
        onClose={() => setViewingBulletin(null)}
        onMarkAsRead={markAsRead}
      />

      {/* Create bulletin modal */}
      <BulletinModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateBulletin}
        isLoading={isCreating}
      />

      {/* Edit bulletin modal */}
      <BulletinModal
        isOpen={!!editingBulletin}
        bulletin={editingBulletin}
        onClose={() => setEditingBulletin(null)}
        onSave={handleUpdateBulletin}
        isLoading={isUpdating}
      />

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Delete bulletin confirmation">
          <div
            className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
            onClick={() => setConfirmDelete(null)}
            aria-hidden="true"
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-sm transform rounded-xl bg-white shadow-xl transition-all">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Bulletin
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to delete &ldquo;{confirmDelete.title}&rdquo;?
                  This action cannot be undone.
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteBulletin}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
