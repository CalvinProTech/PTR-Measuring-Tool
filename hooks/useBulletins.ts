"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  BulletinData,
  BulletinCreateInput,
  BulletinUpdateInput,
  BulletinListResponse,
  BulletinResponse,
} from "@/types";

const COLLAPSED_STORAGE_KEY = "bulletin-board-collapsed";

interface UseBulletinsReturn {
  bulletins: BulletinData[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  createBulletin: (input: BulletinCreateInput) => Promise<BulletinData | null>;
  updateBulletin: (
    id: string,
    input: BulletinUpdateInput
  ) => Promise<BulletinData | null>;
  deleteBulletin: (id: string) => Promise<boolean>;
  markAsRead: (id: string) => Promise<boolean>;
  refreshBulletins: () => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function useBulletins(): UseBulletinsReturn {
  const [bulletins, setBulletins] = useState<BulletinData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCollapsed, setIsCollapsedState] = useState(true);

  // Load collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSED_STORAGE_KEY);
    if (stored !== null) {
      setIsCollapsedState(stored === "true");
    }
  }, []);

  // Persist collapsed state
  const setIsCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsedState(collapsed);
    localStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed));
  }, []);

  // Fetch bulletins for selected month
  const fetchBulletins = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const monthParam = formatMonth(selectedMonth);
      const response = await fetch(`/api/bulletins?month=${monthParam}`);
      const data: BulletinListResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch bulletins");
      }

      setBulletins(data.data?.bulletins || []);
      setUnreadCount(data.data?.unreadCount || 0);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch bulletins";
      setError(message);
      console.error("[useBulletins] Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  // Load bulletins on mount and when month changes
  useEffect(() => {
    fetchBulletins();
  }, [fetchBulletins]);

  // Create a new bulletin
  const createBulletin = useCallback(
    async (input: BulletinCreateInput): Promise<BulletinData | null> => {
      try {
        setIsCreating(true);
        setError(null);

        const response = await fetch("/api/bulletins", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        const data: BulletinResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to create bulletin");
        }

        if (data.data) {
          // Add to list if it's in the current month
          const bulletinDate = new Date(data.data.publishDate);
          if (
            bulletinDate.getFullYear() === selectedMonth.getFullYear() &&
            bulletinDate.getMonth() === selectedMonth.getMonth()
          ) {
            setBulletins((prev) => [data.data!, ...prev]);
          }
          // Increment unread count since it's a new bulletin
          setUnreadCount((prev) => prev + 1);
          return data.data;
        }

        return null;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create bulletin";
        setError(message);
        console.error("[useBulletins] Create error:", err);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [selectedMonth]
  );

  // Update a bulletin
  const updateBulletin = useCallback(
    async (
      id: string,
      input: BulletinUpdateInput
    ): Promise<BulletinData | null> => {
      try {
        setIsUpdating(true);
        setError(null);

        const response = await fetch(`/api/bulletins/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        const data: BulletinResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to update bulletin");
        }

        if (data.data) {
          setBulletins((prev) =>
            prev.map((b) => (b.id === id ? data.data! : b))
          );
          return data.data;
        }

        return null;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update bulletin";
        setError(message);
        console.error("[useBulletins] Update error:", err);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  // Delete a bulletin
  const deleteBulletin = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(`/api/bulletins/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to delete bulletin");
      }

      // Find the bulletin to check if it was unread
      const deletedBulletin = bulletins.find((b) => b.id === id);
      if (deletedBulletin && !deletedBulletin.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Remove from list
      setBulletins((prev) => prev.filter((b) => b.id !== id));
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete bulletin";
      setError(message);
      console.error("[useBulletins] Delete error:", err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [bulletins]);

  // Mark a bulletin as read
  const markAsRead = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`/api/bulletins/${id}/read`, {
        method: "POST",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to mark bulletin as read");
      }

      // Update local state optimistically
      setBulletins((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isRead: true } : b))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to mark bulletin as read";
      setError(message);
      console.error("[useBulletins] Mark as read error:", err);
      return false;
    }
  }, []);

  return {
    bulletins,
    unreadCount,
    isLoading,
    error,
    selectedMonth,
    setSelectedMonth,
    createBulletin,
    updateBulletin,
    deleteBulletin,
    markAsRead,
    refreshBulletins: fetchBulletins,
    isCreating,
    isUpdating,
    isDeleting,
    isCollapsed,
    setIsCollapsed,
  };
}
