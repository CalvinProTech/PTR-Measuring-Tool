"use client";

import { useState, useEffect, useCallback } from "react";
import type { GeocodeResult, StoredSavedAddress } from "@/types";
import {
  getSavedAddresses,
  saveAddress as saveAddressToStorage,
  removeSavedAddress as removeSavedAddressFromStorage,
  isAddressSaved as checkIsAddressSaved,
  updateSavedAddressNickname as updateNicknameInStorage,
} from "@/lib/local-storage";

interface UseSavedAddressesReturn {
  savedAddresses: StoredSavedAddress[];
  saveAddress: (geocode: GeocodeResult, nickname?: string) => void;
  removeAddress: (id: string) => void;
  updateNickname: (id: string, nickname: string) => void;
  isSaved: (formattedAddress: string) => boolean;
  isLoading: boolean;
}

export function useSavedAddresses(): UseSavedAddressesReturn {
  const [savedAddresses, setSavedAddresses] = useState<StoredSavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    setSavedAddresses(getSavedAddresses());
    setIsLoading(false);
  }, []);

  const saveAddress = useCallback((geocode: GeocodeResult, nickname?: string) => {
    saveAddressToStorage(geocode, nickname);
    setSavedAddresses(getSavedAddresses());
  }, []);

  const removeAddress = useCallback((id: string) => {
    removeSavedAddressFromStorage(id);
    setSavedAddresses(getSavedAddresses());
  }, []);

  const updateNickname = useCallback((id: string, nickname: string) => {
    updateNicknameInStorage(id, nickname);
    setSavedAddresses(getSavedAddresses());
  }, []);

  const isSaved = useCallback((formattedAddress: string) => {
    return checkIsAddressSaved(formattedAddress);
  }, []);

  return {
    savedAddresses,
    saveAddress,
    removeAddress,
    updateNickname,
    isSaved,
    isLoading,
  };
}
