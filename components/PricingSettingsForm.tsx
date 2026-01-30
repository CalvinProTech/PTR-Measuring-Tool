"use client";

import { useState } from "react";
import type { PricingSettingsData } from "@/types";

interface PricingSettingsFormProps {
  initialSettings: PricingSettingsData;
  onSave: (settings: Partial<PricingSettingsData>) => Promise<void>;
}

export function PricingSettingsForm({
  initialSettings,
  onSave,
}: PricingSettingsFormProps) {
  const [settings, setSettings] = useState({
    costPerSqFt: initialSettings.costPerSqFt,
    targetProfit: initialSettings.targetProfit,
    commissionRate: initialSettings.commissionRate * 100, // Convert to percentage for display
    gutterPricePerFt: initialSettings.gutterPricePerFt,
    tier1DealerFee: initialSettings.tier1DealerFee * 100,
    tier2DealerFee: initialSettings.tier2DealerFee * 100,
    tier3DealerFee: initialSettings.tier3DealerFee * 100,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await onSave({
        costPerSqFt: settings.costPerSqFt,
        targetProfit: settings.targetProfit,
        commissionRate: settings.commissionRate / 100, // Convert back to decimal
        gutterPricePerFt: settings.gutterPricePerFt,
        tier1DealerFee: settings.tier1DealerFee / 100,
        tier2DealerFee: settings.tier2DealerFee / 100,
        tier3DealerFee: settings.tier3DealerFee / 100,
      });
      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch {
      setMessage({ type: "error", text: "Failed to save settings. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Base Pricing Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Base Pricing</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="costPerSqFt" className="block text-sm font-medium text-gray-700">
              Cost per Sq Ft ($)
            </label>
            <input
              type="number"
              id="costPerSqFt"
              step="0.01"
              min="0"
              value={settings.costPerSqFt}
              onChange={(e) => handleChange("costPerSqFt", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="targetProfit" className="block text-sm font-medium text-gray-700">
              Target Profit ($)
            </label>
            <input
              type="number"
              id="targetProfit"
              step="100"
              min="0"
              value={settings.targetProfit}
              onChange={(e) => handleChange("targetProfit", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700">
              Commission Rate (%)
            </label>
            <input
              type="number"
              id="commissionRate"
              step="0.5"
              min="0"
              max="100"
              value={settings.commissionRate}
              onChange={(e) => handleChange("commissionRate", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="gutterPricePerFt" className="block text-sm font-medium text-gray-700">
              Gutter Price per Ft ($)
            </label>
            <input
              type="number"
              id="gutterPricePerFt"
              step="0.5"
              min="0"
              value={settings.gutterPricePerFt}
              onChange={(e) => handleChange("gutterPricePerFt", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Tier Pricing Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tier Dealer Fees</h3>
        <p className="text-sm text-gray-500 mb-4">
          Set the dealer fee percentage for each pricing tier. These fees are added on top of the base cash price.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="tier1DealerFee" className="block text-sm font-medium text-gray-700">
              Tier 1 (Low) Fee (%)
            </label>
            <input
              type="number"
              id="tier1DealerFee"
              step="0.5"
              min="0"
              max="100"
              value={settings.tier1DealerFee}
              onChange={(e) => handleChange("tier1DealerFee", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">Usually 0% (cash price)</p>
          </div>
          <div>
            <label htmlFor="tier2DealerFee" className="block text-sm font-medium text-gray-700">
              Tier 2 (Middle) Fee (%)
            </label>
            <input
              type="number"
              id="tier2DealerFee"
              step="0.5"
              min="0"
              max="100"
              value={settings.tier2DealerFee}
              onChange={(e) => handleChange("tier2DealerFee", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">Default: 10%</p>
          </div>
          <div>
            <label htmlFor="tier3DealerFee" className="block text-sm font-medium text-gray-700">
              Tier 3 (High) Fee (%)
            </label>
            <input
              type="number"
              id="tier3DealerFee"
              step="0.5"
              min="0"
              max="100"
              value={settings.tier3DealerFee}
              onChange={(e) => handleChange("tier3DealerFee", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">Default: 15%</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-md p-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </button>
      </div>
    </form>
  );
}
