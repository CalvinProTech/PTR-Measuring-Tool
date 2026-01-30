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
          <p className="mt-4 text-sm text-gray-500">Loading settings...</p>
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
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-medium text-red-800">Error loading settings</h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pricing Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure the pricing parameters used for roof estimation calculations.
        </p>
      </div>

      {/* Settings Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <PricingSettingsForm initialSettings={settings} onSave={handleSave} />
      </div>
    </div>
  );
}
