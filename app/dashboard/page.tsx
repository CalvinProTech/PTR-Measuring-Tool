"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { AddressForm } from "@/components/AddressForm";
import { RoofFeaturesForm } from "@/components/RoofFeaturesForm";
import { RoofResults } from "@/components/RoofResults";
import { PricingResults } from "@/components/PricingResults";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CacheStatusBadge } from "@/components/CacheStatusBadge";
import { calculatePricing } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { useSavedAddresses } from "@/hooks/useSavedAddresses";
import { useEstimateCache } from "@/hooks/useEstimateCache";
import type {
  EstimateData,
  GeocodeResult,
  GeocodeResponse,
  RoofAnalysisResponse,
  PropertyValueResponse,
  PricingSettingsData,
  PricingSettingsResponse,
  RoofFeatureAdjustments,
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

  // Hooks for localStorage features
  const { recentSearches, addSearch, clearSearches } = useRecentSearches();
  const { savedAddresses, saveAddress, removeAddress, isSaved } = useSavedAddresses();
  const { getCached, setCache, clearCache, getCacheAgeDays } = useEstimateCache();

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

  const handleAddressSubmit = async (address: string, forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    setEstimate(null);
    setIsFromCache(false);
    setCacheAge(null);

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

      // Step 2: Get roof analysis and property value in parallel
      const [roofRes, propertyValueRes] = await Promise.all([
        fetch(`/api/roof-analysis?lat=${latitude}&lng=${longitude}`),
        fetch(`/api/property-value?address=${encodeURIComponent(formattedAddress)}`),
      ]);

      const roofData: RoofAnalysisResponse = await roofRes.json();
      const propertyValueData: PropertyValueResponse = await propertyValueRes.json();

      if (!roofData.success || !roofData.data) {
        throw new Error(roofData.error || "Failed to analyze roof");
      }

      // Cache the geocode and roof data
      setCache(formattedAddress, geocodeData.data, roofData.data);

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

    try {
      // Check cache first
      const cached = getCached(geocode.formattedAddress);
      if (cached) {
        const age = getCacheAgeDays(geocode.formattedAddress);
        setCacheAge(age);
        setIsFromCache(true);

        // Add to recent searches
        addSearch(geocode);

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

      // No cache - fetch roof data
      const [roofRes, propertyValueRes] = await Promise.all([
        fetch(`/api/roof-analysis?lat=${geocode.latitude}&lng=${geocode.longitude}`),
        fetch(`/api/property-value?address=${encodeURIComponent(geocode.formattedAddress)}`),
      ]);

      const roofData: RoofAnalysisResponse = await roofRes.json();
      const propertyValueData: PropertyValueResponse = await propertyValueRes.json();

      if (!roofData.success || !roofData.data) {
        throw new Error(roofData.error || "Failed to analyze roof");
      }

      // Cache the data
      setCache(geocode.formattedAddress, geocode, roofData.data);

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
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Roof Estimation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter a property address to get instant roof measurements and pricing
          estimates.
        </p>
      </div>

      {/* Address Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
        <div className="mt-4 border-t border-gray-200 pt-4">
          <RoofFeaturesForm onChange={setRoofFeatures} disabled={isLoading} />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mt-8 flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-gray-500">
            Analyzing roof data...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex">
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
        <div className="mt-8 space-y-6">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={handleSaveAddress}
              disabled={isAddressSaved}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isAddressSaved
                  ? "bg-green-50 text-green-700 cursor-default"
                  : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
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
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Property Views</h2>
              <p className="mt-1 text-sm text-gray-500">
                {estimate.address.formattedAddress}
              </p>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Street View</p>
                <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg">
                  <Image
                    src={estimate.address.streetViewUrl}
                    alt={`Street view of ${estimate.address.formattedAddress}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Aerial View</p>
                <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg">
                  <Image
                    src={estimate.address.aerialViewUrl}
                    alt={`Aerial view of ${estimate.address.formattedAddress}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            {/* Property Value Estimate */}
            {estimate.propertyValue && (
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Estimated Property Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(estimate.propertyValue.price)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Range: {formatCurrency(estimate.propertyValue.priceRangeLow)} - {formatCurrency(estimate.propertyValue.priceRangeHigh)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {estimate.propertyValue.bedrooms && (
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{estimate.propertyValue.bedrooms}</p>
                        <p className="text-xs text-gray-500">Beds</p>
                      </div>
                    )}
                    {estimate.propertyValue.bathrooms && (
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{estimate.propertyValue.bathrooms}</p>
                        <p className="text-xs text-gray-500">Baths</p>
                      </div>
                    )}
                    {estimate.propertyValue.squareFootage && (
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{estimate.propertyValue.squareFootage.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Sq Ft</p>
                      </div>
                    )}
                    {estimate.propertyValue.yearBuilt && (
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{estimate.propertyValue.yearBuilt}</p>
                        <p className="text-xs text-gray-500">Built</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <RoofResults address={estimate.address} roof={estimate.roof} />
          <PricingResults
            pricing={estimate.pricing}
            sqFt={estimate.roof.roofAreaSqFt}
            roofFeatures={estimate.roofFeatures}
          />
        </div>
      )}

      {/* Empty State */}
      {!estimate && !isLoading && !error && (
        <div className="mt-8 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            No estimate yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Enter a property address above to generate a roof estimate.
          </p>
        </div>
      )}

      {/* Save Address Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Save Address</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add an optional nickname to easily identify this address.
            </p>

            <div className="mt-4">
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                Nickname (optional)
              </label>
              <input
                type="text"
                id="nickname"
                value={saveNickname}
                onChange={(e) => setSaveNickname(e.target.value)}
                placeholder="e.g., Smith Residence"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmSaveAddress}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
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
