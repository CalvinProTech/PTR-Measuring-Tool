"use client";

import { useState, useEffect, useCallback } from "react";
import type { GeocodeResult, StoredSearch } from "@/types";
import {
  getRecentSearches,
  addRecentSearch as addRecentSearchToStorage,
  clearRecentSearches as clearRecentSearchesFromStorage,
} from "@/lib/local-storage";

interface UseRecentSearchesReturn {
  recentSearches: StoredSearch[];
  addSearch: (geocode: GeocodeResult) => void;
  clearSearches: () => void;
  isLoading: boolean;
}

export function useRecentSearches(): UseRecentSearchesReturn {
  const [recentSearches, setRecentSearches] = useState<StoredSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
    setIsLoading(false);
  }, []);

  const addSearch = useCallback((geocode: GeocodeResult) => {
    addRecentSearchToStorage(geocode);
    setRecentSearches(getRecentSearches());
  }, []);

  const clearSearches = useCallback(() => {
    clearRecentSearchesFromStorage();
    setRecentSearches([]);
  }, []);

  return {
    recentSearches,
    addSearch,
    clearSearches,
    isLoading,
  };
}
