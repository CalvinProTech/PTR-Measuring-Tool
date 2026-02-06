"use client";

import { useCallback } from "react";
import type { NearbyPlacesData } from "@/types";
import {
  getCachedNearbyPlaces,
  setCachedNearbyPlaces as setCacheInStorage,
  CachedNearbyPlaces,
} from "@/lib/local-storage";

interface UseNearbyPlacesReturn {
  getCached: (formattedAddress: string) => CachedNearbyPlaces | null;
  setCache: (formattedAddress: string, data: NearbyPlacesData) => void;
}

export function useNearbyPlaces(): UseNearbyPlacesReturn {
  const getCached = useCallback((formattedAddress: string) => {
    return getCachedNearbyPlaces(formattedAddress);
  }, []);

  const setCache = useCallback(
    (formattedAddress: string, data: NearbyPlacesData) => {
      setCacheInStorage(formattedAddress, data);
    },
    []
  );

  return {
    getCached,
    setCache,
  };
}
