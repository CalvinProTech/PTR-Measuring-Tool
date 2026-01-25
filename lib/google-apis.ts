import type { GeocodeResult, RoofData, RoofSegment } from "@/types";
import { sqMetersToSqFeet, pitchDegreesToRatio } from "./utils";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const SOLAR_API_BASE = "https://solar.googleapis.com/v1";
const GEOCODING_API_BASE = "https://maps.googleapis.com/maps/api/geocode/json";

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

  return {
    formattedAddress: result.formatted_address,
    latitude: location.lat,
    longitude: location.lng,
    city,
    state,
    zipCode,
  };
}

/**
 * Get building insights from Google Solar API
 */
export async function getBuildingInsights(
  lat: number,
  lng: number
): Promise<RoofData | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  const url = `${SOLAR_API_BASE}/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=HIGH&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    // Solar API might not be available for all locations
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Solar API error: ${response.statusText}`);
  }

  const data = await response.json();

  // Extract roof data from Solar API response
  const solarPotential = data.solarPotential;
  if (!solarPotential) {
    return null;
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
  // The Solar API doesn't directly provide these, so we estimate based on area
  const estimatedPerimeter = estimatePerimeter(roofAreaSqFt, segments.length);

  return {
    roofAreaSqFt: Math.round(roofAreaSqFt),
    roofFacets: segments.length || 1,
    predominantPitch,
    ridgesHipsFt: Math.round(estimatedPerimeter * 0.3), // Estimate ~30% of perimeter
    valleysFt: Math.round(estimatedPerimeter * 0.1), // Estimate ~10% of perimeter
    rakesFt: Math.round(estimatedPerimeter * 0.25), // Estimate ~25% of perimeter
    eavesFt: Math.round(estimatedPerimeter * 0.35), // Estimate ~35% of perimeter
    perimeterFt: Math.round(estimatedPerimeter),
  };
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

  return pitchDegreesToRatio(largest.pitchDegrees || 18.43); // Default ~4/12
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
