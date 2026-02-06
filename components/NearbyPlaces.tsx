"use client";

import Image from "next/image";
import type { NearbyPlacesData, NearbyPlace, PlaceCategory } from "@/types";

interface NearbyPlacesProps {
  data: NearbyPlacesData;
  address: string;
}

const CATEGORY_ICONS: Record<PlaceCategory, React.ReactNode> = {
  restaurant: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
  school: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
    />
  ),
  park: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  ),
};

const CATEGORY_DOT_COLORS: Record<PlaceCategory, string> = {
  restaurant: "bg-amber-400",
  school: "bg-blue-400",
  park: "bg-emerald-400",
};

export function NearbyPlaces({ data, address }: NearbyPlacesProps) {
  const places = data.categories
    .filter((cat) => cat.places.length > 0)
    .map((cat) => ({
      ...cat.places[0],
      categoryLabel: cat.label,
    }));

  if (places.length === 0) {
    return null;
  }

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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <div>
            <h2 className="section-title">Nearby Highlights</h2>
            <p className="text-sm text-neutral-500">
              Top local spots near {address}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-3">
        {places.map((place) => (
          <PlaceCard
            key={place.placeId}
            place={place}
            categoryLabel={place.categoryLabel}
            icon={CATEGORY_ICONS[place.category]}
          />
        ))}
      </div>
    </div>
  );
}

interface PlaceCardProps {
  place: NearbyPlace;
  categoryLabel: string;
  icon: React.ReactNode;
}

function PlaceCard({ place, categoryLabel, icon }: PlaceCardProps) {
  return (
    <div className="card-hover p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className={`h-2 w-2 rounded-full ${CATEGORY_DOT_COLORS[place.category]}`} />
        <svg
          className="h-4 w-4 text-primary-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icon}
        </svg>
        <span className="text-xs font-medium uppercase tracking-wide text-primary-600">
          {categoryLabel}
        </span>
        <span className="ml-auto text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
          Open
        </span>
      </div>

      {place.photoUrl && (
        <div className="relative w-full h-24 rounded-lg overflow-hidden bg-neutral-200 mb-3">
          <Image
            src={place.photoUrl}
            alt={place.name}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <h3 className="font-semibold text-neutral-800 truncate" title={place.name}>
        {place.name}
      </h3>
      <p className="text-sm text-neutral-500 truncate mt-1" title={place.vicinity}>
        {place.vicinity}
      </p>

      <div className="mt-2 flex items-center gap-1">
        <span className="inline-flex items-center gap-1 bg-amber-50 rounded-full px-2 py-0.5">
          <svg
            className="h-3.5 w-3.5 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-medium text-neutral-700">
            {place.rating.toFixed(1)}
          </span>
        </span>
        <span className="text-xs text-neutral-400">
          ({place.userRatingsTotal.toLocaleString()})
        </span>
      </div>
    </div>
  );
}
