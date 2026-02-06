"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { AddressForm } from "@/components/AddressForm";
import { RoofFeaturesForm } from "@/components/RoofFeaturesForm";
import { RoofResults } from "@/components/RoofResults";
import { PricingResults } from "@/components/PricingResults";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CacheStatusBadge } from "@/components/CacheStatusBadge";
import { NearbyPlaces } from "@/components/NearbyPlaces";
import { NearbyPlacesSkeleton } from "@/components/NearbyPlacesSkeleton";
import { PopulationDensity } from "@/components/PopulationDensity";
import { PopulationDensitySkeleton } from "@/components/PopulationDensitySkeleton";
import { BulletinBoard } from "@/components/bulletins/BulletinBoard";
import { calculatePricing } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { useSavedAddresses } from "@/hooks/useSavedAddresses";
import { useEstimateCache } from "@/hooks/useEstimateCache";
import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";
import { usePopulationDensity } from "@/hooks/usePopulationDensity";
import type {
  EstimateData,
  GeocodeResult,
  GeocodeResponse,
  RoofAnalysisResponse,
  PropertyValueResponse,
  PricingSettingsData,
  PricingSettingsResponse,
  RoofFeatureAdjustments,
  NearbyPlacesData,
  NearbyPlacesResponse,
  PopulationDensityData,
  PopulationDensityResponse,
  SearchRadiusMiles,
  UserRole,
} from "@/types";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [pricingSettings, setPricingSettings] = useState<PricingSettingsData | null>(null);
  const [roofFeatures, setRoofFeatures] = useState<RoofFeatureAdjustments>({
    hasSolarPanels: false,
    solarPanelCount: 0,
    hasSkylights: false,
    skylightCount: 0,
    hasSatellites: false,
    satelliteCount: 0,
  });
  const [cacheAge, setCacheAge] = useState<number | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveNickname, setSaveNickname] = useState("");
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlacesData | null>(null);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [searchRadius, setSearchRadius] = useState<SearchRadiusMiles>(5);
  const [populationDensity, setPopulationDensity] = useState<PopulationDensityData | null>(null);
  const [isLoadingDensity, setIsLoadingDensity] = useState(false);

  // Hooks for localStorage features
  const { recentSearches, addSearch, clearSearches } = useRecentSearches();
  const { savedAddresses, saveAddress, removeAddress, isSaved } = useSavedAddresses();
  const { getCached, setCache, clearCache, getCacheAgeDays } = useEstimateCache();
  const { getCached: getCachedPlaces, setCache: setCachePlaces } = useNearbyPlaces();
  const { getCached: getCachedDensity, setCache: setCacheDensity } = usePopulationDensity();

  // Get user role for bulletin board
  const { user } = useUser();
  const isOwner = (user?.publicMetadata?.role as UserRole) === "owner";

  // Fetch pricing settings on mount
  useEffect(() => {
    async function fetchPricingSettings() {
      try {
        const res = await fetch("/api/settings/pricing");
        const data: PricingSettingsResponse = await res.json();
        if (data.success && data.data) {
          setPricingSettings(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch pricing settings:", err);
      }
    }
    fetchPricingSettings();
  }, []);

  const processEstimate = useCallback(
    (
      geocodeData: GeocodeResult,
      roofData: RoofAnalysisResponse["data"],
      propertyValueData?: PropertyValueResponse["data"]
    ) => {
      if (!roofData) return;

      const pricing = calculatePricing({
        sqFt: roofData.roofAreaSqFt,
        perimeterFt: roofData.perimeterFt,
        roofFeatures,
        ...(pricingSettings && {
          costPerSqFt: pricingSettings.costPerSqFt,
          targetProfit: pricingSettings.targetProfit,
          gutterPricePerFt: pricingSettings.gutterPricePerFt,
          tier1DealerFee: pricingSettings.tier1DealerFee,
          tier2DealerFee: pricingSettings.tier2DealerFee,
          tier3DealerFee: pricingSettings.tier3DealerFee,
          solarPanelPricePerUnit: pricingSettings.solarPanelPricePerUnit,
          skylightPricePerUnit: pricingSettings.skylightPricePerUnit,
          satellitePricePerUnit: pricingSettings.satellitePricePerUnit,
        }),
      });

      setEstimate({
        address: geocodeData,
        roof: roofData,
        pricing,
        propertyValue: propertyValueData,
        roofFeatures,
      });
    },
    [pricingSettings, roofFeatures]
  );

  // Recalculate pricing when roof features change and estimate exists
  useEffect(() => {
    if (estimate && pricingSettings) {
      const newPricing = calculatePricing({
        sqFt: estimate.roof.roofAreaSqFt,
        perimeterFt: estimate.roof.perimeterFt,
        roofFeatures,
        costPerSqFt: pricingSettings.costPerSqFt,
        targetProfit: pricingSettings.targetProfit,
        gutterPricePerFt: pricingSettings.gutterPricePerFt,
        tier1DealerFee: pricingSettings.tier1DealerFee,
        tier2DealerFee: pricingSettings.tier2DealerFee,
        tier3DealerFee: pricingSettings.tier3DealerFee,
        solarPanelPricePerUnit: pricingSettings.solarPanelPricePerUnit,
        skylightPricePerUnit: pricingSettings.skylightPricePerUnit,
        satellitePricePerUnit: pricingSettings.satellitePricePerUnit,
      });

      setEstimate((prev) =>
        prev
          ? {
              ...prev,
              pricing: newPricing,
              roofFeatures,
            }
          : null
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roofFeatures, pricingSettings]);

  const handleAddressSubmit = async (address: string, forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    setEstimate(null);
    setIsFromCache(false);
    setCacheAge(null);
    setNearbyPlaces(null);
    setPopulationDensity(null);

    try {
      // Check cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cached = getCached(address);
        if (cached) {
          const age = getCacheAgeDays(address);
          setCacheAge(age);
          setIsFromCache(true);

          // Add to recent searches
          addSearch(cached.geocode);

          // Check for cached nearby places
          const cachedPlaces = getCachedPlaces(cached.geocode.formattedAddress);
          if (cachedPlaces) {
            setNearbyPlaces(cachedPlaces.data);
          } else {
            // Fetch nearby places in background
            setIsLoadingPlaces(true);
            fetch(`/api/nearby-places?lat=${cached.geocode.latitude}&lng=${cached.geocode.longitude}&radius=${searchRadius}`)
              .then(res => res.json())
              .then((placesData: NearbyPlacesResponse) => {
                if (placesData.success && placesData.data) {
                  setNearbyPlaces(placesData.data);
                  setCachePlaces(cached.geocode.formattedAddress, placesData.data);
                }
              })
              .finally(() => setIsLoadingPlaces(false));
          }

          // Check for cached population density
          const cachedDensityData = getCachedDensity(cached.geocode.formattedAddress);
          if (cachedDensityData) {
            setPopulationDensity(cachedDensityData.data);
          } else {
            setIsLoadingDensity(true);
            fetch(`/api/population-density?lat=${cached.geocode.latitude}&lng=${cached.geocode.longitude}`)
              .then(res => res.json())
              .then((densityData: PopulationDensityResponse) => {
                if (densityData.success && densityData.data) {
                  setPopulationDensity(densityData.data);
                  setCacheDensity(cached.geocode.formattedAddress, densityData.data);
                }
              })
              .finally(() => setIsLoadingDensity(false));
          }

          // Only fetch property value (not cached)
          const propertyValueRes = await fetch(
            `/api/property-value?address=${encodeURIComponent(cached.geocode.formattedAddress)}`
          );
          const propertyValueData: PropertyValueResponse = await propertyValueRes.json();

          processEstimate(
            cached.geocode,
            cached.roof,
            propertyValueData.success ? propertyValueData.data : undefined
          );

          setIsLoading(false);
          return;
        }
      }

      // Step 1: Geocode the address
      const geocodeRes = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      const geocodeData: GeocodeResponse = await geocodeRes.json();

      if (!geocodeData.success || !geocodeData.data) {
        throw new Error(geocodeData.error || "Failed to validate address");
      }

      const { latitude, longitude, formattedAddress } = geocodeData.data;

      // Check cache again with formatted address
      if (!forceRefresh) {
        const cached = getCached(formattedAddress);
        if (cached) {
          const age = getCacheAgeDays(formattedAddress);
          setCacheAge(age);
          setIsFromCache(true);

          // Add to recent searches
          addSearch(geocodeData.data);

          // Check for cached nearby places
          const cachedPlaces = getCachedPlaces(formattedAddress);
          if (cachedPlaces) {
            setNearbyPlaces(cachedPlaces.data);
          } else {
            // Fetch nearby places in background
            setIsLoadingPlaces(true);
            fetch(`/api/nearby-places?lat=${latitude}&lng=${longitude}&radius=${searchRadius}`)
              .then(res => res.json())
              .then((placesData: NearbyPlacesResponse) => {
                if (placesData.success && placesData.data) {
                  setNearbyPlaces(placesData.data);
                  setCachePlaces(formattedAddress, placesData.data);
                }
              })
              .finally(() => setIsLoadingPlaces(false));
          }

          // Check for cached population density
          const cachedDensityData2 = getCachedDensity(formattedAddress);
          if (cachedDensityData2) {
            setPopulationDensity(cachedDensityData2.data);
          } else {
            setIsLoadingDensity(true);
            fetch(`/api/population-density?lat=${latitude}&lng=${longitude}`)
              .then(res => res.json())
              .then((densityData: PopulationDensityResponse) => {
                if (densityData.success && densityData.data) {
                  setPopulationDensity(densityData.data);
                  setCacheDensity(formattedAddress, densityData.data);
                }
              })
              .finally(() => setIsLoadingDensity(false));
          }

          // Only fetch property value
          const propertyValueRes = await fetch(
            `/api/property-value?address=${encodeURIComponent(formattedAddress)}`
          );
          const propertyValueData: PropertyValueResponse = await propertyValueRes.json();

          processEstimate(
            cached.geocode,
            cached.roof,
            propertyValueData.success ? propertyValueData.data : undefined
          );

          setIsLoading(false);
          return;
        }
      }

      // Step 2: Get roof analysis, property value, nearby places, and population density in parallel
      const [roofRes, propertyValueRes, nearbyPlacesRes, populationDensityRes] = await Promise.all([
        fetch(`/api/roof-analysis?lat=${latitude}&lng=${longitude}`),
        fetch(`/api/property-value?address=${encodeURIComponent(formattedAddress)}`),
        fetch(`/api/nearby-places?lat=${latitude}&lng=${longitude}&radius=${searchRadius}`),
        fetch(`/api/population-density?lat=${latitude}&lng=${longitude}`),
      ]);

      const roofData: RoofAnalysisResponse = await roofRes.json();
      const propertyValueData: PropertyValueResponse = await propertyValueRes.json();
      const nearbyPlacesData: NearbyPlacesResponse = await nearbyPlacesRes.json();
      const populationDensityData: PopulationDensityResponse = await populationDensityRes.json();

      if (!roofData.success || !roofData.data) {
        throw new Error(roofData.error || "Failed to analyze roof");
      }

      // Cache the geocode and roof data
      setCache(formattedAddress, geocodeData.data, roofData.data);

      // Cache and set nearby places
      if (nearbyPlacesData.success && nearbyPlacesData.data) {
        setNearbyPlaces(nearbyPlacesData.data);
        setCachePlaces(formattedAddress, nearbyPlacesData.data);
      }

      // Cache and set population density
      if (populationDensityData.success && populationDensityData.data) {
        setPopulationDensity(populationDensityData.data);
        setCacheDensity(formattedAddress, populationDensityData.data);
      }

      // Add to recent searches
      addSearch(geocodeData.data);

      // Process and display estimate
      processEstimate(
        geocodeData.data,
        roofData.data,
        propertyValueData.success ? propertyValueData.data : undefined
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromDropdown = async (geocode: GeocodeResult) => {
    setIsLoading(true);
    setError(null);
    setEstimate(null);
    setIsFromCache(false);
    setCacheAge(null);
    setNearbyPlaces(null);
    setPopulationDensity(null);

    try {
      // Check cache first
      const cached = getCached(geocode.formattedAddress);
      if (cached) {
        const age = getCacheAgeDays(geocode.formattedAddress);
        setCacheAge(age);
        setIsFromCache(true);

        // Add to recent searches
        addSearch(geocode);

        // Check for cached nearby places
        const cachedPlaces = getCachedPlaces(geocode.formattedAddress);
        if (cachedPlaces) {
          setNearbyPlaces(cachedPlaces.data);
        } else {
          // Fetch nearby places in background
          setIsLoadingPlaces(true);
          fetch(`/api/nearby-places?lat=${geocode.latitude}&lng=${geocode.longitude}&radius=${searchRadius}`)
            .then(res => res.json())
            .then((placesData: NearbyPlacesResponse) => {
              if (placesData.success && placesData.data) {
                setNearbyPlaces(placesData.data);
                setCachePlaces(geocode.formattedAddress, placesData.data);
              }
            })
            .finally(() => setIsLoadingPlaces(false));
        }

        // Check for cached population density
        const cachedDensityData3 = getCachedDensity(geocode.formattedAddress);
        if (cachedDensityData3) {
          setPopulationDensity(cachedDensityData3.data);
        } else {
          setIsLoadingDensity(true);
          fetch(`/api/population-density?lat=${geocode.latitude}&lng=${geocode.longitude}`)
            .then(res => res.json())
            .then((densityData: PopulationDensityResponse) => {
              if (densityData.success && densityData.data) {
                setPopulationDensity(densityData.data);
                setCacheDensity(geocode.formattedAddress, densityData.data);
              }
            })
            .finally(() => setIsLoadingDensity(false));
        }

        // Only fetch property value
        const propertyValueRes = await fetch(
          `/api/property-value?address=${encodeURIComponent(geocode.formattedAddress)}`
        );
        const propertyValueData: PropertyValueResponse = await propertyValueRes.json();

        processEstimate(
          cached.geocode,
          cached.roof,
          propertyValueData.success ? propertyValueData.data : undefined
        );

        setIsLoading(false);
        return;
      }

      // No cache - fetch roof data, nearby places, and population density
      const [roofRes, propertyValueRes, nearbyPlacesRes, populationDensityRes] = await Promise.all([
        fetch(`/api/roof-analysis?lat=${geocode.latitude}&lng=${geocode.longitude}`),
        fetch(`/api/property-value?address=${encodeURIComponent(geocode.formattedAddress)}`),
        fetch(`/api/nearby-places?lat=${geocode.latitude}&lng=${geocode.longitude}&radius=${searchRadius}`),
        fetch(`/api/population-density?lat=${geocode.latitude}&lng=${geocode.longitude}`),
      ]);

      const roofData: RoofAnalysisResponse = await roofRes.json();
      const propertyValueData: PropertyValueResponse = await propertyValueRes.json();
      const nearbyPlacesData: NearbyPlacesResponse = await nearbyPlacesRes.json();
      const populationDensityData: PopulationDensityResponse = await populationDensityRes.json();

      if (!roofData.success || !roofData.data) {
        throw new Error(roofData.error || "Failed to analyze roof");
      }

      // Cache the data
      setCache(geocode.formattedAddress, geocode, roofData.data);

      // Cache and set nearby places
      if (nearbyPlacesData.success && nearbyPlacesData.data) {
        setNearbyPlaces(nearbyPlacesData.data);
        setCachePlaces(geocode.formattedAddress, nearbyPlacesData.data);
      }

      // Cache and set population density
      if (populationDensityData.success && populationDensityData.data) {
        setPopulationDensity(populationDensityData.data);
        setCacheDensity(geocode.formattedAddress, populationDensityData.data);
      }

      // Add to recent searches
      addSearch(geocode);

      // Process estimate
      processEstimate(
        geocode,
        roofData.data,
        propertyValueData.success ? propertyValueData.data : undefined
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshCache = async () => {
    if (!estimate) return;

    // Clear the cache for this address and re-fetch
    clearCache(estimate.address.formattedAddress);
    await handleAddressSubmit(estimate.address.formattedAddress, true);
  };

  const handleRadiusChange = async (radius: SearchRadiusMiles) => {
    setSearchRadius(radius);

    if (!estimate) return;

    // Re-fetch nearby places with new radius
    setIsLoadingPlaces(true);
    try {
      const res = await fetch(
        `/api/nearby-places?lat=${estimate.address.latitude}&lng=${estimate.address.longitude}&radius=${radius}`
      );
      const placesData: NearbyPlacesResponse = await res.json();
      if (placesData.success && placesData.data) {
        setNearbyPlaces(placesData.data);
        setCachePlaces(estimate.address.formattedAddress, placesData.data);
      }
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  const handleSaveAddress = () => {
    if (!estimate) return;

    if (isSaved(estimate.address.formattedAddress)) {
      return;
    }

    setShowSaveModal(true);
    setSaveNickname("");
  };

  const confirmSaveAddress = () => {
    if (!estimate) return;

    saveAddress(estimate.address, saveNickname.trim() || undefined);
    setShowSaveModal(false);
    setSaveNickname("");
  };

  const isAddressSaved = estimate ? isSaved(estimate.address.formattedAddress) : false;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Bulletin Board */}
      <BulletinBoard isOwner={isOwner} />

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-neutral-800">Roof Estimation</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Enter a property address to get instant roof measurements and pricing
          estimates.
        </p>
      </div>

      {/* Address Form */}
      <div className="card p-6 relative">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400 rounded-t-xl" />
        <AddressForm
          onSubmit={handleAddressSubmit}
          onSelectFromDropdown={handleSelectFromDropdown}
          isLoading={isLoading}
          recentSearches={recentSearches}
          savedAddresses={savedAddresses}
          onClearRecents={clearSearches}
          onRemoveSaved={removeAddress}
        />

        {/* Roof Features Section */}
        <div className="mt-4 border-t border-neutral-200 pt-4">
          <RoofFeaturesForm onChange={setRoofFeatures} disabled={isLoading} />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mt-8 flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-neutral-500">
            Analyzing roof data...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="mt-8 rounded-xl bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200 p-4 animate-fade-in">
          <div className="flex">
            <div className="bg-red-100 rounded-full p-2">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error analyzing property
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {estimate && !isLoading && (
        <div className="mt-8 space-y-8">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in-up">
            <button
              onClick={handleSaveAddress}
              disabled={isAddressSaved}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isAddressSaved
                  ? "bg-green-50 text-green-700 cursor-default"
                  : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:shadow-sm"
              }`}
            >
              {isAddressSaved ? (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Saved
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Save Address
                </>
              )}
            </button>

            {isFromCache && cacheAge !== null && (
              <CacheStatusBadge
                cacheDaysAgo={cacheAge}
                onRefresh={handleRefreshCache}
                isRefreshing={isLoading}
              />
            )}
          </div>

          {/* Property Views */}
          <div className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="section-header">
              <h2 className="section-title">Property Views</h2>
              <p className="section-subtitle">
                {estimate.address.formattedAddress}
              </p>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-600">Street View</p>
                <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl ring-1 ring-neutral-200/50">
                  <Image
                    src={estimate.address.streetViewUrl}
                    alt={`Street view of ${estimate.address.formattedAddress}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-600">Aerial View</p>
                <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl ring-1 ring-neutral-200/50">
                  <Image
                    src={estimate.address.aerialViewUrl}
                    alt={`Aerial view of ${estimate.address.formattedAddress}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
            {/* Property Value Estimate */}
            {estimate.propertyValue && (
              <div className="border-t border-neutral-200 px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">Estimated Property Value</p>
                    <p className="font-display text-3xl font-bold text-primary-800">
                      {formatCurrency(estimate.propertyValue.price)}
                    </p>
                    <p className="text-xs text-neutral-400">
                      Range: {formatCurrency(estimate.propertyValue.priceRangeLow)} - {formatCurrency(estimate.propertyValue.priceRangeHigh)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {estimate.propertyValue.bedrooms && (
                      <div className="text-center bg-neutral-50 rounded-lg px-4 py-2">
                        <p className="font-display font-bold text-neutral-800">{estimate.propertyValue.bedrooms}</p>
                        <p className="text-xs text-neutral-500">Beds</p>
                      </div>
                    )}
                    {estimate.propertyValue.bathrooms && (
                      <div className="text-center bg-neutral-50 rounded-lg px-4 py-2">
                        <p className="font-display font-bold text-neutral-800">{estimate.propertyValue.bathrooms}</p>
                        <p className="text-xs text-neutral-500">Baths</p>
                      </div>
                    )}
                    {estimate.propertyValue.squareFootage && (
                      <div className="text-center bg-neutral-50 rounded-lg px-4 py-2">
                        <p className="font-display font-bold text-neutral-800">{estimate.propertyValue.squareFootage.toLocaleString()}</p>
                        <p className="text-xs text-neutral-500">Sq Ft</p>
                      </div>
                    )}
                    {estimate.propertyValue.yearBuilt && (
                      <div className="text-center bg-neutral-50 rounded-lg px-4 py-2">
                        <p className="font-display font-bold text-neutral-800">{estimate.propertyValue.yearBuilt}</p>
                        <p className="text-xs text-neutral-500">Built</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nearby Places */}
          <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-neutral-600">Search radius:</span>
              <div className="flex gap-2">
                {([5, 10, 25] as const).map((radius) => (
                  <button
                    key={radius}
                    onClick={() => handleRadiusChange(radius)}
                    disabled={isLoadingPlaces}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                      searchRadius === radius
                        ? "bg-primary-600 text-white shadow-sm"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    } ${isLoadingPlaces ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {radius} mi
                  </button>
                ))}
              </div>
            </div>

            {isLoadingPlaces ? (
              <NearbyPlacesSkeleton />
            ) : nearbyPlaces ? (
              <NearbyPlaces
                data={nearbyPlaces}
                address={estimate.address.formattedAddress}
              />
            ) : null}
          </div>

          {/* Population Density */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            {isLoadingDensity ? (
              <PopulationDensitySkeleton />
            ) : populationDensity ? (
              <PopulationDensity data={populationDensity} />
            ) : null}
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <RoofResults address={estimate.address} roof={estimate.roof} />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <PricingResults
              pricing={estimate.pricing}
              sqFt={estimate.roof.roofAreaSqFt}
              roofFeatures={estimate.roofFeatures}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!estimate && !isLoading && !error && (
        <div className="mt-8 rounded-2xl bg-gradient-to-br from-neutral-50 to-primary-50/30 border-2 border-dashed border-neutral-200 p-12 text-center animate-fade-in">
          <div className="mx-auto bg-primary-100 rounded-2xl p-6 w-fit">
            <svg
              className="h-12 w-12 text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h3 className="mt-4 font-display text-sm font-semibold text-neutral-800">
            No estimate yet
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Enter a property address above to generate a roof estimate.
          </p>
        </div>
      )}

      {/* Save Address Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-elevated animate-scale-in">
            <h3 className="font-display text-lg font-semibold text-neutral-800">Save Address</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Add an optional nickname to easily identify this address.
            </p>

            <div className="mt-4">
              <label htmlFor="nickname" className="block text-sm font-medium text-neutral-700">
                Nickname (optional)
              </label>
              <input
                type="text"
                id="nickname"
                value={saveNickname}
                onChange={(e) => setSaveNickname(e.target.value)}
                placeholder="e.g., Smith Residence"
                className="mt-1 block w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSaveAddress}
                className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
