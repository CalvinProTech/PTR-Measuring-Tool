"use client";

import { useCallback } from "react";
import type { GeocodeResult, RoofData, CachedEstimate } from "@/types";
import {
  getCachedEstimate,
  setCachedEstimate as setCacheInStorage,
  clearCachedEstimate,
  getCacheAge,
  isCached as checkIsCached,
} from "@/lib/local-storage";

interface UseEstimateCacheReturn {
  getCached: (formattedAddress: string) => CachedEstimate | null;
  setCache: (formattedAddress: string, geocode: GeocodeResult, roof: RoofData) => void;
  clearCache: (formattedAddress: string) => void;
  isCached: (formattedAddress: string) => boolean;
  getCacheAgeDays: (formattedAddress: string) => number | null;
}

export function useEstimateCache(): UseEstimateCacheReturn {
  const getCached = useCallback((formattedAddress: string) => {
    return getCachedEstimate(formattedAddress);
  }, []);

  const setCache = useCallback(
    (formattedAddress: string, geocode: GeocodeResult, roof: RoofData) => {
      setCacheInStorage(formattedAddress, geocode, roof);
    },
    []
  );

  const clearCache = useCallback((formattedAddress: string) => {
    clearCachedEstimate(formattedAddress);
  }, []);

  const isCached = useCallback((formattedAddress: string) => {
    return checkIsCached(formattedAddress);
  }, []);

  const getCacheAgeDays = useCallback((formattedAddress: string) => {
    return getCacheAge(formattedAddress);
  }, []);

  return {
    getCached,
    setCache,
    clearCache,
    isCached,
    getCacheAgeDays,
  };
}
