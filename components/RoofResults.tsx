import type { RoofData, GeocodeResult } from "@/types";
import { formatNumber } from "@/lib/utils";

interface RoofResultsProps {
  address: GeocodeResult;
  roof: RoofData;
}

export function RoofResults({ address, roof }: RoofResultsProps) {
  const measurements = [
    {
      label: "Roof Area",
      value: `${formatNumber(roof.roofAreaSqFt)} sq ft`,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      ),
    },
    {
      label: "Roof Facets",
      value: roof.roofFacets.toString(),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      ),
    },
    {
      label: "Predominant Pitch",
      value: roof.predominantPitch,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      ),
    },
    {
      label: "Ridges/Hips",
      value: `${formatNumber(roof.ridgesHipsFt)} ft`,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      ),
    },
    {
      label: "Valleys",
      value: `${formatNumber(roof.valleysFt)} ft`,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      ),
    },
    {
      label: "Rakes",
      value: `${formatNumber(roof.rakesFt)} ft`,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h7"
        />
      ),
    },
    {
      label: "Eaves",
      value: `${formatNumber(roof.eavesFt)} ft`,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
        />
      ),
    },
    {
      label: "Perimeter",
      value: `${formatNumber(roof.perimeterFt)} ft`,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
        />
      ),
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Roof Measurements
        </h2>
        <p className="mt-1 text-sm text-gray-500">{address.formattedAddress}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
        {measurements.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-gray-100 bg-gray-50 p-4"
          >
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {item.icon}
              </svg>
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {item.label}
              </span>
            </div>
            <p className="mt-2 text-xl font-semibold text-gray-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
