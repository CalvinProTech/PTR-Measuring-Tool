"use client";

import { useState } from "react";
import type { RoofFeatureAdjustments } from "@/types";

interface RoofFeaturesFormProps {
  onChange: (features: RoofFeatureAdjustments) => void;
  disabled?: boolean;
}

export function RoofFeaturesForm({ onChange, disabled = false }: RoofFeaturesFormProps) {
  const [features, setFeatures] = useState<RoofFeatureAdjustments>({
    hasSolarPanels: false,
    solarPanelCount: 0,
    hasSkylights: false,
    skylightCount: 0,
    hasSatellites: false,
    satelliteCount: 0,
  });

  const handleToggle = (field: "hasSolarPanels" | "hasSkylights" | "hasSatellites") => {
    const countField =
      field === "hasSolarPanels"
        ? "solarPanelCount"
        : field === "hasSkylights"
          ? "skylightCount"
          : "satelliteCount";

    const newFeatures = {
      ...features,
      [field]: !features[field],
      // Reset count to 0 when unchecking, set to 1 when checking
      [countField]: !features[field] ? 1 : 0,
    };
    setFeatures(newFeatures);
    onChange(newFeatures);
  };

  const handleCountChange = (
    field: "solarPanelCount" | "skylightCount" | "satelliteCount",
    value: number
  ) => {
    const newFeatures = {
      ...features,
      [field]: Math.max(0, value),
    };
    setFeatures(newFeatures);
    onChange(newFeatures);
  };

  const featureItems = [
    {
      label: "Solar Panels",
      hasField: "hasSolarPanels" as const,
      countField: "solarPanelCount" as const,
      icon: (
        <svg
          className="h-5 w-5 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
          />
        </svg>
      ),
    },
    {
      label: "Skylights",
      hasField: "hasSkylights" as const,
      countField: "skylightCount" as const,
      icon: (
        <svg
          className="h-5 w-5 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
          />
        </svg>
      ),
    },
    {
      label: "Satellite Dishes",
      hasField: "hasSatellites" as const,
      countField: "satelliteCount" as const,
      icon: (
        <svg
          className="h-5 w-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.288 15.038a5.25 5.25 0 0 1 7.424-7.424m-1.414 1.414a2.5 2.5 0 1 0-4.596 4.596M12 12l3.75 3.75M3 3l7.5 7.5M12 12l-3.75 3.75M12 3v1.5M3 12h1.5M12 21v-1.5M21 12h-1.5"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">
        Roof Features <span className="font-normal text-gray-500">(additional costs apply)</span>
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {featureItems.map((item) => (
          <div
            key={item.hasField}
            className={`rounded-lg border p-3 transition-colors ${
              features[item.hasField]
                ? "border-primary-300 bg-primary-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={features[item.hasField]}
                onChange={() => handleToggle(item.hasField)}
                disabled={disabled}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              {item.icon}
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </label>
            {features[item.hasField] && (
              <div className="mt-2 flex items-center gap-2">
                <label className="text-xs text-gray-500">Qty:</label>
                <input
                  type="number"
                  min="1"
                  value={features[item.countField]}
                  onChange={(e) =>
                    handleCountChange(item.countField, parseInt(e.target.value) || 0)
                  }
                  disabled={disabled}
                  className="w-16 rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
