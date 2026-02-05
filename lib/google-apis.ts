import type { GeocodeResult, RoofData, RoofSegment } from "@/types";
import { sqMetersToSqFeet, pitchDegreesToRatio } from "./utils";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const SOLAR_API_BASE = "https://solar.googleapis.com/v1";
const GEOCODING_API_BASE = "https://maps.googleapis.com/maps/api/geocode/json";
const STREET_VIEW_API_BASE = "https://maps.googleapis.com/maps/api/streetview";
const STATIC_MAP_API_BASE = "https://maps.googleapis.com/maps/api/staticmap";

/**
 * Geocode an address using Google Geocoding API
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  const url = new URL(GEOCODING_API_BASE);
  url.searchParams.set("address", address);
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status !== "OK" || !data.results?.length) {
    return null;
  }

  const result = data.results[0];
  const location = result.geometry.location;

  // Extract address components
  const components = result.address_components || [];
  let city = "";
  let state = "";
  let zipCode = "";

  for (const component of components) {
    const types = component.types || [];
    if (types.includes("locality")) {
      city = component.long_name;
    } else if (types.includes("administrative_area_level_1")) {
      state = component.short_name;
    } else if (types.includes("postal_code")) {
      zipCode = component.long_name;
    }
  }

  // Construct Street View URL
  const streetViewUrl = `${STREET_VIEW_API_BASE}?size=800x400&location=${location.lat},${location.lng}&key=${GOOGLE_MAPS_API_KEY}`;

  // Construct Aerial/Satellite View URL
  const aerialViewUrl = `${STATIC_MAP_API_BASE}?center=${location.lat},${location.lng}&zoom=20&size=800x400&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;

  return {
    formattedAddress: result.formatted_address,
    latitude: location.lat,
    longitude: location.lng,
    city,
    state,
    zipCode,
    streetViewUrl,
    aerialViewUrl,
  };
}

/**
 * Get building insights from Google Solar API
 * Tries HIGH quality first, then falls back to MEDIUM and LOW if unavailable
 */
export async function getBuildingInsights(
  lat: number,
  lng: number
): Promise<RoofData | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  const qualityLevels = ["HIGH", "MEDIUM", "LOW"] as const;

  for (const quality of qualityLevels) {
    const url = `${SOLAR_API_BASE}/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=${quality}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();

      // Extract roof data from Solar API response
      const solarPotential = data.solarPotential;
      if (!solarPotential) {
        continue; // Try next quality level
      }

      const segments: RoofSegment[] = solarPotential.roofSegmentStats || [];
      const wholeRoofStats = solarPotential.wholeRoofStats;

      // Calculate total roof area in sq ft
      const roofAreaSqFt = wholeRoofStats?.areaMeters2
        ? sqMetersToSqFeet(wholeRoofStats.areaMeters2)
        : segments.reduce(
            (sum, seg) => sum + sqMetersToSqFeet(seg.areaMeters2),
            0
          );

      // Find predominant pitch (from largest segment)
      const predominantPitch = calculatePredominantPitch(segments);

      // Estimate edge lengths (these are approximations based on available data)
      const estimatedPerimeter = estimatePerimeter(roofAreaSqFt, segments.length);

      return {
        roofAreaSqFt: Math.round(roofAreaSqFt),
        roofFacets: segments.length || 1,
        predominantPitch,
        ridgesHipsFt: Math.round(estimatedPerimeter * 0.3),
        valleysFt: Math.round(estimatedPerimeter * 0.1),
        rakesFt: Math.round(estimatedPerimeter * 0.25),
        eavesFt: Math.round(estimatedPerimeter * 0.35),
        perimeterFt: Math.round(estimatedPerimeter),
      };
    }

    // If 404, try next quality level
    if (response.status === 404) {
      continue;
    }

    // For other errors, throw
    throw new Error(`Solar API error: ${response.statusText}`);
  }

  // No data available at any quality level
  return null;
}

/**
 * Calculate predominant pitch from roof segments
 */
function calculatePredominantPitch(segments: RoofSegment[]): string {
  if (!segments.length) {
    return "4/12"; // Default pitch
  }

  // Find segment with largest area
  const largest = segments.reduce((prev, curr) =>
    curr.areaMeters2 > prev.areaMeters2 ? curr : prev
  );

  // Use nullish coalescing to preserve 0 values (flat roofs)
  const pitchDegrees = largest.pitchDegrees ?? 18.43; // Default ~4/12

  // Treat pitches under 7.2 degrees as flat (0/12)
  // 7.2° ≈ 1.5/12, so anything that would round to 0/12 or 1/12 is considered flat
  // This accounts for Solar API reporting small non-zero values for flat roofs
  if (pitchDegrees < 7.2) {
    return "0/12";
  }

  return pitchDegreesToRatio(pitchDegrees);
}

/**
 * Estimate perimeter based on roof area and number of facets
 * This is an approximation since Solar API doesn't provide exact edge lengths
 */
function estimatePerimeter(areaSqFt: number, facets: number): number {
  // Assuming roughly square proportions per facet
  // Perimeter ≈ 4 * sqrt(area / facets) * facets * adjustment factor
  const avgFacetArea = areaSqFt / Math.max(facets, 1);
  const avgFacetSide = Math.sqrt(avgFacetArea);
  // Use a factor to account for rectangular shapes and overlaps
  return avgFacetSide * 4 * Math.sqrt(facets) * 0.8;
}
