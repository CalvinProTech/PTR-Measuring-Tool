import type { GeocodeResult, RoofData } from "@/types";

// Storage keys
const STORAGE_KEYS = {
  RECENT_SEARCHES: "protech_recent_searches",
  SAVED_ADDRESSES: "protech_saved_addresses",
  ESTIMATE_CACHE: "protech_estimate_cache",
} as const;

// Constants
const MAX_RECENT_SEARCHES = 10;
const ROOF_TTL_DAYS = 30;

// Types
export interface StoredSearch {
  id: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  zipCode: string;
  streetViewUrl: string;
  aerialViewUrl: string;
  searchedAt: number;
}

export interface StoredSavedAddress extends StoredSearch {
  nickname?: string;
  savedAt: number;
}

export interface CachedEstimate {
  geocode: GeocodeResult;
  roof: RoofData;
  cachedAt: number;
}

// Helper to check if running in browser
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// Helper to generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Helper to get data from localStorage
function getStorageData<T>(key: string, defaultValue: T): T {
  if (!isBrowser()) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// Helper to set data in localStorage
function setStorageData<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save to localStorage: ${key}`, error);
  }
}

// ============ Recent Searches ============

export function getRecentSearches(): StoredSearch[] {
  return getStorageData<StoredSearch[]>(STORAGE_KEYS.RECENT_SEARCHES, []);
}

export function setRecentSearches(searches: StoredSearch[]): void {
  setStorageData(STORAGE_KEYS.RECENT_SEARCHES, searches);
}

export function addRecentSearch(geocode: GeocodeResult): StoredSearch {
  const searches = getRecentSearches();

  // Remove existing entry with same address (deduplication)
  const filtered = searches.filter(
    (s) => s.formattedAddress !== geocode.formattedAddress
  );

  // Create new search entry
  const newSearch: StoredSearch = {
    id: generateId(),
    formattedAddress: geocode.formattedAddress,
    latitude: geocode.latitude,
    longitude: geocode.longitude,
    city: geocode.city,
    state: geocode.state,
    zipCode: geocode.zipCode,
    streetViewUrl: geocode.streetViewUrl,
    aerialViewUrl: geocode.aerialViewUrl,
    searchedAt: Date.now(),
  };

  // Add to front and limit to max
  const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  setRecentSearches(updated);

  return newSearch;
}

export function clearRecentSearches(): void {
  setStorageData(STORAGE_KEYS.RECENT_SEARCHES, []);
}

// ============ Saved Addresses ============

export function getSavedAddresses(): StoredSavedAddress[] {
  return getStorageData<StoredSavedAddress[]>(STORAGE_KEYS.SAVED_ADDRESSES, []);
}

export function setSavedAddresses(addresses: StoredSavedAddress[]): void {
  setStorageData(STORAGE_KEYS.SAVED_ADDRESSES, addresses);
}

export function saveAddress(geocode: GeocodeResult, nickname?: string): StoredSavedAddress {
  const addresses = getSavedAddresses();

  // Check if already saved
  const existing = addresses.find(
    (a) => a.formattedAddress === geocode.formattedAddress
  );
  if (existing) {
    return existing;
  }

  const newAddress: StoredSavedAddress = {
    id: generateId(),
    formattedAddress: geocode.formattedAddress,
    latitude: geocode.latitude,
    longitude: geocode.longitude,
    city: geocode.city,
    state: geocode.state,
    zipCode: geocode.zipCode,
    streetViewUrl: geocode.streetViewUrl,
    aerialViewUrl: geocode.aerialViewUrl,
    searchedAt: Date.now(),
    nickname,
    savedAt: Date.now(),
  };

  setSavedAddresses([newAddress, ...addresses]);
  return newAddress;
}

export function removeSavedAddress(id: string): void {
  const addresses = getSavedAddresses();
  setSavedAddresses(addresses.filter((a) => a.id !== id));
}

export function isAddressSaved(formattedAddress: string): boolean {
  const addresses = getSavedAddresses();
  return addresses.some((a) => a.formattedAddress === formattedAddress);
}

export function updateSavedAddressNickname(id: string, nickname: string): void {
  const addresses = getSavedAddresses();
  const updated = addresses.map((a) =>
    a.id === id ? { ...a, nickname } : a
  );
  setSavedAddresses(updated);
}

// ============ Estimate Cache ============

type CacheMap = Record<string, CachedEstimate>;

function getCacheMap(): CacheMap {
  return getStorageData<CacheMap>(STORAGE_KEYS.ESTIMATE_CACHE, {});
}

function setCacheMap(cache: CacheMap): void {
  setStorageData(STORAGE_KEYS.ESTIMATE_CACHE, cache);
}

// Normalize address for consistent cache keys
function normalizeAddress(address: string): string {
  return address.toLowerCase().trim();
}

export function getCachedEstimate(formattedAddress: string): CachedEstimate | null {
  const cache = getCacheMap();
  const key = normalizeAddress(formattedAddress);
  const cached = cache[key];

  if (!cached) return null;

  // Check if roof data is still fresh (30 days)
  const roofAgeMs = Date.now() - cached.cachedAt;
  const roofAgeDays = roofAgeMs / (1000 * 60 * 60 * 24);

  if (roofAgeDays > ROOF_TTL_DAYS) {
    // Cache expired, remove it
    delete cache[key];
    setCacheMap(cache);
    return null;
  }

  return cached;
}

export function setCachedEstimate(
  formattedAddress: string,
  geocode: GeocodeResult,
  roof: RoofData
): void {
  const cache = getCacheMap();
  const key = normalizeAddress(formattedAddress);

  cache[key] = {
    geocode,
    roof,
    cachedAt: Date.now(),
  };

  setCacheMap(cache);
}

export function clearCachedEstimate(formattedAddress: string): void {
  const cache = getCacheMap();
  const key = normalizeAddress(formattedAddress);
  delete cache[key];
  setCacheMap(cache);
}

export function isCached(formattedAddress: string): boolean {
  return getCachedEstimate(formattedAddress) !== null;
}

export function getCacheAge(formattedAddress: string): number | null {
  const cached = getCachedEstimate(formattedAddress);
  if (!cached) return null;
  return Math.floor((Date.now() - cached.cachedAt) / (1000 * 60 * 60 * 24));
}

// Clear all cached data
export function clearAllCache(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
  localStorage.removeItem(STORAGE_KEYS.SAVED_ADDRESSES);
  localStorage.removeItem(STORAGE_KEYS.ESTIMATE_CACHE);
}
