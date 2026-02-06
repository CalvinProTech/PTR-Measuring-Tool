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
    gutterPricePerFt: initialSettings.gutterPricePerFt,
    tier1DealerFee: initialSettings.tier1DealerFee * 100,
    tier2DealerFee: initialSettings.tier2DealerFee * 100,
    tier3DealerFee: initialSettings.tier3DealerFee * 100,
    solarPanelPricePerUnit: initialSettings.solarPanelPricePerUnit,
    skylightPricePerUnit: initialSettings.skylightPricePerUnit,
    satellitePricePerUnit: initialSettings.satellitePricePerUnit,
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
        gutterPricePerFt: settings.gutterPricePerFt,
        tier1DealerFee: settings.tier1DealerFee / 100,
        tier2DealerFee: settings.tier2DealerFee / 100,
        tier3DealerFee: settings.tier3DealerFee / 100,
        solarPanelPricePerUnit: settings.solarPanelPricePerUnit,
        skylightPricePerUnit: settings.skylightPricePerUnit,
        satellitePricePerUnit: settings.satellitePricePerUnit,
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
      {/* Target Profit - Main Control */}
      <div className="border-l-4 border-primary-200 pl-6">
        <h3 className="font-display text-lg font-semibold text-neutral-800 mb-2">Target Profit</h3>
        <p className="text-sm text-neutral-500 mb-4">
          This is the main control for adjusting all prices up or down. Increasing target profit raises all tier prices proportionally.
        </p>
        <div className="max-w-xs">
          <label htmlFor="targetProfit" className="block text-sm font-medium text-neutral-600">
            Target Profit ($)
          </label>
          <input
            type="number"
            id="targetProfit"
            step="100"
            min="0"
            value={settings.targetProfit}
            onChange={(e) => handleChange("targetProfit", e.target.value)}
            className="mt-1 block w-full rounded-xl border border-neutral-200 px-4 py-3 text-lg shadow-sm transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <p className="mt-1 text-xs text-neutral-400">Default: $2,000</p>
        </div>
      </div>

      {/* Base Cost Settings */}
      <div className="border-l-4 border-primary-200 pl-6">
        <h3 className="font-display text-lg font-semibold text-neutral-800 mb-2">Base Costs</h3>
        <p className="text-sm text-neutral-500 mb-4">
          Adjust if material or labor costs change. Commission rate is fixed at 30% (agent 10% + owner 10% + lead 10%).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="costPerSqFt" className="block text-sm font-medium text-neutral-600">
              Cost per Sq Ft ($)
            </label>
            <input
              type="number"
              id="costPerSqFt"
              step="0.01"
              min="0"
              value={settings.costPerSqFt}
              onChange={(e) => handleChange("costPerSqFt", e.target.value)}
              className="mt-1 block w-full rounded-xl border border-neutral-200 px-4 py-2.5 shadow-sm transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="mt-1 text-xs text-neutral-400">Default: $5.00</p>
          </div>
          <div>
            <label htmlFor="gutterPricePerFt" className="block text-sm font-medium text-neutral-600">
              Gutter Price per Ft ($)
            </label>
            <input
              type="number"
              id="gutterPricePerFt"
              step="0.5"
              min="0"
              value={settings.gutterPricePerFt}
              onChange={(e) => handleChange("gutterPricePerFt", e.target.value)}
              className="mt-1 block w-full rounded-xl border border-neutral-200 px-4 py-2.5 shadow-sm transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="mt-1 text-xs text-neutral-400">Default: $15.00</p>
          </div>
        </div>
      </div>

      {/* Tier Pricing Section */}
      <div className="border-l-4 border-primary-200 pl-6">
        <h3 className="font-display text-lg font-semibold text-neutral-800 mb-2">Tier Dealer Fees</h3>
        <p className="text-sm text-neutral-500 mb-4">
          Dealer fees are added to the base 30% commission. Total fee = 30% + dealer fee.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="tier1DealerFee" className="block text-sm font-medium text-neutral-600">
              Tier 1 - Cash (%)
            </label>
            <input
              type="number"
              id="tier1DealerFee"
              step="0.5"
              min="0"
              max="69"
              value={settings.tier1DealerFee}
              onChange={(e) => handleChange("tier1DealerFee", e.target.value)}
              className="mt-1 block w-full rounded-xl border border-neutral-200 px-4 py-2.5 shadow-sm transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="mt-1 text-xs text-neutral-400">Default: 0% (total: 30%)</p>
          </div>
          <div>
            <label htmlFor="tier2DealerFee" className="block text-sm font-medium text-neutral-600">
              Tier 2 - Standard (%)
            </label>
            <input
              type="number"
              id="tier2DealerFee"
              step="0.5"
              min="0"
              max="69"
              value={settings.tier2DealerFee}
              onChange={(e) => handleChange("tier2DealerFee", e.target.value)}
              className="mt-1 block w-full rounded-xl border border-neutral-200 px-4 py-2.5 shadow-sm transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="mt-1 text-xs text-neutral-400">Default: 10% (total: 40%)</p>
          </div>
          <div>
            <label htmlFor="tier3DealerFee" className="block text-sm font-medium text-neutral-600">
              Tier 3 - Premium (%)
            </label>
            <input
              type="number"
              id="tier3DealerFee"
              step="0.5"
              min="0"
              max="69"
              value={settings.tier3DealerFee}
              onChange={(e) => handleChange("tier3DealerFee", e.target.value)}
              className="mt-1 block w-full rounded-xl border border-neutral-200 px-4 py-2.5 shadow-sm transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="mt-1 text-xs text-neutral-400">Default: 15% (total: 45%)</p>
          </div>
        </div>
      </div>

      {/* Roof Feature Adjustments Section */}
      <div className="border-l-4 border-primary-200 pl-6">
        <h3 className="font-display text-lg font-semibold text-neutral-800 mb-4">Roof Feature Adjustments</h3>
        <p className="text-sm text-neutral-500 mb-4">
          Set the additional cost per unit for roof features that require removal/reinstallation during roofing work.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="solarPanelPricePerUnit" className="block text-sm font-medium text-neutral-600">
              Solar Panel ($/unit)
            </label>
            <input
              type="number"
              id="solarPanelPricePerUnit"
              step="1"
              min="0"
              value={settings.solarPanelPricePerUnit}
              onChange={(e) => handleChange("solarPanelPricePerUnit", e.target.value)}
              className="mt-1 block w-full rounded-xl border border-neutral-200 px-4 py-2.5 shadow-sm transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="mt-1 text-xs text-neutral-400">Default: $150</p>
          </div>
          <div>
            <label htmlFor="skylightPricePerUnit" className="block text-sm font-medium text-neutral-600">
              Skylight ($/unit)
            </label>
            <input
              type="number"
              id="skylightPricePerUnit"
              step="1"
              min="0"
              value={settings.skylightPricePerUnit}
              onChange={(e) => handleChange("skylightPricePerUnit", e.target.value)}
              className="mt-1 block w-full rounded-xl border border-neutral-200 px-4 py-2.5 shadow-sm transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="mt-1 text-xs text-neutral-400">Default: $200</p>
          </div>
          <div>
            <label htmlFor="satellitePricePerUnit" className="block text-sm font-medium text-neutral-600">
              Satellite Dish ($/unit)
            </label>
            <input
              type="number"
              id="satellitePricePerUnit"
              step="1"
              min="0"
              value={settings.satellitePricePerUnit}
              onChange={(e) => handleChange("satellitePricePerUnit", e.target.value)}
              className="mt-1 block w-full rounded-xl border border-neutral-200 px-4 py-2.5 shadow-sm transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="mt-1 text-xs text-neutral-400">Default: $75</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-xl p-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
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
          className="inline-flex items-center rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-600/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
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
