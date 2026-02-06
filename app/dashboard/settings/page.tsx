"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { PricingSettingsForm } from "@/components/PricingSettingsForm";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { PricingSettingsData, PricingSettingsResponse, UserRole } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [settings, setSettings] = useState<PricingSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is owner
  const role = (user?.publicMetadata?.role as UserRole) || "agent";
  const isOwner = role === "owner";

  useEffect(() => {
    // Redirect non-owners once user data is loaded
    if (isUserLoaded && !isOwner) {
      router.push("/dashboard");
      return;
    }

    // Only fetch settings if user is owner
    if (!isUserLoaded || !isOwner) {
      return;
    }

    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings/pricing");
        const data: PricingSettingsResponse = await res.json();

        if (!data.success || !data.data) {
          throw new Error(data.error || "Failed to load settings");
        }

        setSettings(data.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load settings";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, [isUserLoaded, isOwner, router]);

  const handleSave = async (updatedSettings: Partial<PricingSettingsData>) => {
    const res = await fetch("/api/settings/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedSettings),
    });

    const data: PricingSettingsResponse = await res.json();

    if (!data.success) {
      if (res.status === 403) {
        // Not authorized - redirect to dashboard
        router.push("/dashboard");
        return;
      }
      throw new Error(data.error || "Failed to save settings");
    }

    if (data.data) {
      setSettings(data.data);
    }
  };

  if (!isUserLoaded || isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-neutral-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not owner (will redirect)
  if (!isOwner) {
    return null;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-red-50/50 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-800">Error loading settings</h3>
              <p className="mt-0.5 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-neutral-800">Pricing Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Configure the pricing parameters used for roof estimation calculations.
        </p>
      </div>

      {/* Settings Form */}
      <div className="card p-8">
        <PricingSettingsForm initialSettings={settings} onSave={handleSave} />
      </div>
    </div>
  );
}
