import type { GeocodeResult, RoofData, NearbyPlacesData, PopulationDensityData } from "@/types";

// Storage keys
const STORAGE_KEYS = {
  RECENT_SEARCHES: "protech_recent_searches",
  SAVED_ADDRESSES: "protech_saved_addresses",
  ESTIMATE_CACHE: "protech_estimate_cache",
  NEARBY_PLACES_CACHE: "protech_nearby_places_cache",
  POPULATION_DENSITY_CACHE: "protech_population_density_cache",
} as const;

// Constants
const MAX_RECENT_SEARCHES = 10;
const ROOF_TTL_DAYS = 30;
const PLACES_TTL_DAYS = 7;
const DENSITY_TTL_DAYS = 90;

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

export interface CachedNearbyPlaces {
  data: NearbyPlacesData;
  cachedAt: number;
}

export interface CachedPopulationDensity {
  data: PopulationDensityData;
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
  localStorage.removeItem(STORAGE_KEYS.NEARBY_PLACES_CACHE);
  localStorage.removeItem(STORAGE_KEYS.POPULATION_DENSITY_CACHE);
}

// ============ Nearby Places Cache ============

type PlacesCacheMap = Record<string, CachedNearbyPlaces>;

function getPlacesCacheMap(): PlacesCacheMap {
  return getStorageData<PlacesCacheMap>(STORAGE_KEYS.NEARBY_PLACES_CACHE, {});
}

function setPlacesCacheMap(cache: PlacesCacheMap): void {
  setStorageData(STORAGE_KEYS.NEARBY_PLACES_CACHE, cache);
}

export function getCachedNearbyPlaces(
  formattedAddress: string
): CachedNearbyPlaces | null {
  const cache = getPlacesCacheMap();
  const key = normalizeAddress(formattedAddress);
  const cached = cache[key];

  if (!cached) return null;

  // Check if cache is still fresh (7 days)
  const ageMs = Date.now() - cached.cachedAt;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays > PLACES_TTL_DAYS) {
    // Cache expired, remove it
    delete cache[key];
    setPlacesCacheMap(cache);
    return null;
  }

  return cached;
}

export function setCachedNearbyPlaces(
  formattedAddress: string,
  data: NearbyPlacesData
): void {
  const cache = getPlacesCacheMap();
  const key = normalizeAddress(formattedAddress);

  cache[key] = {
    data,
    cachedAt: Date.now(),
  };

  setPlacesCacheMap(cache);
}

// ============ Population Density Cache ============

type DensityCacheMap = Record<string, CachedPopulationDensity>;

function getDensityCacheMap(): DensityCacheMap {
  return getStorageData<DensityCacheMap>(STORAGE_KEYS.POPULATION_DENSITY_CACHE, {});
}

function setDensityCacheMap(cache: DensityCacheMap): void {
  setStorageData(STORAGE_KEYS.POPULATION_DENSITY_CACHE, cache);
}

export function getCachedPopulationDensity(
  formattedAddress: string
): CachedPopulationDensity | null {
  const cache = getDensityCacheMap();
  const key = normalizeAddress(formattedAddress);
  const cached = cache[key];

  if (!cached) return null;

  const ageMs = Date.now() - cached.cachedAt;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays > DENSITY_TTL_DAYS) {
    delete cache[key];
    setDensityCacheMap(cache);
    return null;
  }

  return cached;
}

export function setCachedPopulationDensity(
  formattedAddress: string,
  data: PopulationDensityData
): void {
  const cache = getDensityCacheMap();
  const key = normalizeAddress(formattedAddress);

  cache[key] = {
    data,
    cachedAt: Date.now(),
  };

  setDensityCacheMap(cache);
}
