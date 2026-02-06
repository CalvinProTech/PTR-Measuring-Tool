import {
  getCachedNearbyPlaces,
  setCachedNearbyPlaces,
} from "@/lib/local-storage";
import type { NearbyPlacesData } from "@/types";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

const createMockNearbyPlacesData = (): NearbyPlacesData => ({
  categories: [
    {
      category: "restaurant",
      label: "Local Restaurant",
      places: [
        {
          placeId: "place_1",
          name: "Test Restaurant",
          rating: 4.5,
          userRatingsTotal: 100,
          vicinity: "123 Main St",
          category: "restaurant",
          combinedScore: 2.5,
        },
      ],
    },
    {
      category: "school",
      label: "Nearby School",
      places: [],
    },
    {
      category: "park",
      label: "Nearby Park",
      places: [],
    },
  ],
  searchedAt: Date.now(),
  radiusMiles: 5,
});

describe("Nearby Places Cache", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe("setCachedNearbyPlaces", () => {
    it("should store nearby places data in localStorage", () => {
      const address = "123 Main St, Tampa, FL";
      const data = createMockNearbyPlacesData();

      setCachedNearbyPlaces(address, data);

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const storedData = JSON.parse(
        localStorageMock.setItem.mock.calls[0][1]
      );
      expect(Object.keys(storedData)).toHaveLength(1);
    });

    it("should normalize address for consistent cache keys", () => {
      const data = createMockNearbyPlacesData();

      setCachedNearbyPlaces("  123 Main St  ", data);
      const cached = getCachedNearbyPlaces("123 main st");

      expect(cached).not.toBeNull();
      expect(cached?.data.categories).toHaveLength(3);
    });
  });

  describe("getCachedNearbyPlaces", () => {
    it("should return null for uncached address", () => {
      const result = getCachedNearbyPlaces("unknown address");
      expect(result).toBeNull();
    });

    it("should return cached data for known address", () => {
      const address = "123 Main St, Tampa, FL";
      const data = createMockNearbyPlacesData();

      setCachedNearbyPlaces(address, data);
      const cached = getCachedNearbyPlaces(address);

      expect(cached).not.toBeNull();
      expect(cached?.data.categories[0].places[0].name).toBe("Test Restaurant");
    });

    it("should return null for expired cache (older than 7 days)", () => {
      const address = "123 Main St, Tampa, FL";
      const data = createMockNearbyPlacesData();

      // Set cache
      setCachedNearbyPlaces(address, data);

      // Manually modify the cached data to simulate old cache
      const cacheKey = "protech_nearby_places_cache";
      const cache = JSON.parse(localStorageMock.getItem(cacheKey) || "{}");
      const normalizedKey = address.toLowerCase().trim();

      // Set cachedAt to 8 days ago
      cache[normalizedKey].cachedAt = Date.now() - 8 * 24 * 60 * 60 * 1000;
      localStorageMock.setItem(cacheKey, JSON.stringify(cache));

      const cached = getCachedNearbyPlaces(address);
      expect(cached).toBeNull();
    });

    it("should return cached data for fresh cache (within 7 days)", () => {
      const address = "123 Main St, Tampa, FL";
      const data = createMockNearbyPlacesData();

      setCachedNearbyPlaces(address, data);

      // Cache is fresh (just created)
      const cached = getCachedNearbyPlaces(address);
      expect(cached).not.toBeNull();
    });

    it("should be case-insensitive for address lookup", () => {
      const data = createMockNearbyPlacesData();

      setCachedNearbyPlaces("123 Main St, Tampa, FL", data);

      const cached = getCachedNearbyPlaces("123 MAIN ST, TAMPA, FL");
      expect(cached).not.toBeNull();
    });
  });

  describe("cache data integrity", () => {
    it("should preserve all categories in cache", () => {
      const address = "123 Main St";
      const data = createMockNearbyPlacesData();

      setCachedNearbyPlaces(address, data);
      const cached = getCachedNearbyPlaces(address);

      expect(cached?.data.categories).toHaveLength(3);
      expect(cached?.data.categories.map((c) => c.category)).toEqual([
        "restaurant",
        "school",
        "park",
      ]);
    });

    it("should preserve place details in cache", () => {
      const address = "123 Main St";
      const data = createMockNearbyPlacesData();

      setCachedNearbyPlaces(address, data);
      const cached = getCachedNearbyPlaces(address);

      const place = cached?.data.categories[0].places[0];
      expect(place?.name).toBe("Test Restaurant");
      expect(place?.rating).toBe(4.5);
      expect(place?.userRatingsTotal).toBe(100);
      expect(place?.combinedScore).toBe(2.5);
    });

    it("should include cachedAt timestamp", () => {
      const address = "123 Main St";
      const data = createMockNearbyPlacesData();
      const beforeCache = Date.now();

      setCachedNearbyPlaces(address, data);

      const cached = getCachedNearbyPlaces(address);
      expect(cached?.cachedAt).toBeGreaterThanOrEqual(beforeCache);
    });
  });
});
