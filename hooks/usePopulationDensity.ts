"use client";

import { useCallback } from "react";
import type { PopulationDensityData } from "@/types";
import {
  getCachedPopulationDensity,
  setCachedPopulationDensity as setCacheInStorage,
  CachedPopulationDensity,
} from "@/lib/local-storage";

interface UsePopulationDensityReturn {
  getCached: (formattedAddress: string) => CachedPopulationDensity | null;
  setCache: (formattedAddress: string, data: PopulationDensityData) => void;
}

export function usePopulationDensity(): UsePopulationDensityReturn {
  const getCached = useCallback((formattedAddress: string) => {
    return getCachedPopulationDensity(formattedAddress);
  }, []);

  const setCache = useCallback(
    (formattedAddress: string, data: PopulationDensityData) => {
      setCacheInStorage(formattedAddress, data);
    },
    []
  );

  return {
    getCached,
    setCache,
  };
}
