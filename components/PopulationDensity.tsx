"use client";

import type { PopulationDensityData, DensityClassification } from "@/types";
import { formatNumber } from "@/lib/utils";

interface PopulationDensityProps {
  data: PopulationDensityData;
}

const CLASSIFICATION_STYLES: Record<
  DensityClassification,
  { bg: string; text: string; label: string }
> = {
  urban: { bg: "bg-red-100", text: "text-red-700", label: "Urban" },
  suburban: { bg: "bg-blue-100", text: "text-blue-700", label: "Suburban" },
  rural: { bg: "bg-green-100", text: "text-green-700", label: "Rural" },
};

export function PopulationDensity({ data }: PopulationDensityProps) {
  const classStyle = CLASSIFICATION_STYLES[data.classification];

  const stats = [
    {
      label: "Population",
      value: formatNumber(data.population),
      sublabel: "Census Tract",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      ),
    },
    {
      label: "Land Area",
      value:
        data.landAreaSqMiles > 0 ? `${data.landAreaSqMiles} sq mi` : "N/A",
      sublabel: "Tract Area",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      ),
    },
    {
      label: "Density",
      value:
        data.densityPerSqMile > 0
          ? `${formatNumber(data.densityPerSqMile)}/sq mi`
          : "N/A",
      sublabel: "People per square mile",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      ),
    },
  ];

  return (
    <div className="card overflow-hidden">
      <div className="section-header">
        <div className="flex items-center gap-3">
          <svg
            className="h-5 w-5 text-primary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="section-title">Area Demographics</h2>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-display font-semibold ${classStyle.bg} ${classStyle.text}`}
              >
                {classStyle.label}
              </span>
            </div>
            <p className="text-sm text-neutral-500">
              Census tract {data.tractId}
              {data.countyName ? ` \u2014 ${data.countyName}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {stat.icon}
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {stat.label}
              </span>
            </div>
            <p className="mt-2 font-display text-xl font-bold text-neutral-800">
              {stat.value}
            </p>
            <p className="text-xs text-neutral-400">{stat.sublabel}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
