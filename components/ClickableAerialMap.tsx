"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface ClickableAerialMapProps {
  lat: number;
  lng: number;
  address: string;
  roofAreaSqFt: number;
  segments: number;
  onLocationClick: (lat: number, lng: number) => void;
  isLoading?: boolean;
}

export function ClickableAerialMap({
  lat,
  lng,
  address: _address,
  roofAreaSqFt,
  segments,
  onLocationClick,
  isLoading = false,
}: ClickableAerialMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [clickedPoint, setClickedPoint] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Determine if measurement looks suspicious
  const isSuspicious = roofAreaSqFt < 800 || segments < 3;

  // Load Google Maps JS API
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }

    // Check if script already exists
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const check = setInterval(() => {
        if (window.google?.maps) {
          setMapLoaded(true);
          clearInterval(check);
        }
      }, 100);
      return () => clearInterval(check);
    }

    // Fetch API key from server
    fetch("/api/maps-key")
      .then((r) => r.json())
      .then((data) => {
        if (!data.key) return;
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.key}`;
        script.async = true;
        script.onload = () => setMapLoaded(true);
        document.head.appendChild(script);
      });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google?.maps) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 20,
      mapTypeId: "satellite",
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "greedy",
    });

    // Original marker (red)
    new window.google.maps.Marker({
      position: { lat, lng },
      map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#ef4444",
        fillOpacity: 0.9,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
      title: "Geocoded location",
    });

    // Click handler
    map.addListener(
      "click",
      (e: { latLng: { lat: () => number; lng: () => number } }) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        setClickedPoint({ lat: newLat, lng: newLng });

        // Add blue marker at clicked point
        new window.google!.maps.Marker({
          position: { lat: newLat, lng: newLng },
          map,
          icon: {
            path: window.google!.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#3b82f6",
            fillOpacity: 0.9,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          title: "New measurement point",
        });
      }
    );
  }, [mapLoaded, lat, lng]);

  const handleRemeasure = useCallback(() => {
    if (clickedPoint) {
      onLocationClick(clickedPoint.lat, clickedPoint.lng);
    }
  }, [clickedPoint, onLocationClick]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-600">
          Aerial View{" "}
          <span className="text-xs text-neutral-400">
            (click roof to re-measure)
          </span>
        </p>
        {clickedPoint && (
          <button
            onClick={handleRemeasure}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Measuring..." : "Re-measure Here"}
          </button>
        )}
      </div>

      {isSuspicious && !clickedPoint && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-800">
            ⚠️ This measurement may be inaccurate
          </p>
          <p className="mt-1 text-xs text-amber-700">
            {roofAreaSqFt < 800
              ? `Only ${roofAreaSqFt} sq ft detected — this may be a shed or garage instead of the main home.`
              : `Only ${segments} roof segments detected — the satellite may have missed part of the roof.`}{" "}
            Click on the correct roof in the map below to re-measure.
          </p>
        </div>
      )}

      <div
        ref={mapRef}
        className="aspect-[2/1] w-full overflow-hidden rounded-xl ring-1 ring-neutral-200/50"
        style={{ minHeight: 250 }}
      />

      {clickedPoint && (
        <p className="text-xs text-blue-600">
          New point selected — click &quot;Re-measure Here&quot; to update the
          estimate
        </p>
      )}
    </div>
  );
}
