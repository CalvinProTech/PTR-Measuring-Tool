"use client";

import { useState } from "react";
import { AddressForm } from "@/components/AddressForm";
import { RoofResults } from "@/components/RoofResults";
import { PricingResults } from "@/components/PricingResults";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { calculatePricing } from "@/lib/pricing";
import type { EstimateData, GeocodeResponse, RoofAnalysisResponse } from "@/types";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<EstimateData | null>(null);

  const handleAddressSubmit = async (address: string) => {
    setIsLoading(true);
    setError(null);
    setEstimate(null);

    try {
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

      const { latitude, longitude } = geocodeData.data;

      // Step 2: Get roof analysis
      const roofRes = await fetch(
        `/api/roof-analysis?lat=${latitude}&lng=${longitude}`
      );

      const roofData: RoofAnalysisResponse = await roofRes.json();

      if (!roofData.success || !roofData.data) {
        throw new Error(roofData.error || "Failed to analyze roof");
      }

      // Step 3: Calculate pricing
      const pricing = calculatePricing({
        sqFt: roofData.data.roofAreaSqFt,
        perimeterFt: roofData.data.perimeterFt,
      });

      // Set the complete estimate
      setEstimate({
        address: geocodeData.data,
        roof: roofData.data,
        pricing,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

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
        <AddressForm onSubmit={handleAddressSubmit} isLoading={isLoading} />
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
          <RoofResults address={estimate.address} roof={estimate.roof} />
          <PricingResults
            pricing={estimate.pricing}
            sqFt={estimate.roof.roofAreaSqFt}
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
    </div>
  );
}
