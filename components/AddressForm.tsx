"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";

interface AddressFormProps {
  onSubmit: (address: string) => Promise<void>;
  isLoading?: boolean;
}

export function AddressForm({ onSubmit, isLoading = false }: AddressFormProps) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedAddress = address.trim();

    if (trimmedAddress.length < 5) {
      setError("Please enter a valid address");
      return;
    }

    try {
      await onSubmit(trimmedAddress);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="address" className="sr-only">
            Property Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter property address (e.g., 123 Main St, Tampa, FL 33601)"
            disabled={isLoading}
            className={cn(
              "block w-full rounded-lg border px-4 py-3 text-gray-900 shadow-sm",
              "placeholder:text-gray-400",
              "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
              "disabled:bg-gray-50 disabled:text-gray-500",
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300"
            )}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !address.trim()}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold shadow-sm",
            "bg-primary-600 text-white",
            "hover:bg-primary-500",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-200"
          )}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="border-white/30 border-t-white" />
              Analyzing...
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Analyze Roof
            </>
          )}
        </button>
      </div>
    </form>
  );
}
