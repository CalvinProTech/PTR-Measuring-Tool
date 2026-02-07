import { NextResponse } from "next/server";
import { getNearbyPlaces } from "@/lib/google-apis";
import { roofAnalysisParamsSchema } from "@/lib/validations";
import type { NearbyPlacesResponse, SearchRadiusMiles } from "@/types";

const VALID_RADII: SearchRadiusMiles[] = [5, 10, 25];

export async function GET(
  request: Request
): Promise<NextResponse<NearbyPlacesResponse>> {
  try {
    // Note: Auth removed to support Salesforce embed which bypasses Clerk

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const radiusParam = parseInt(searchParams.get("radius") || "5", 10);

    // Validate radius (default to 5 if invalid)
    const radius: SearchRadiusMiles = VALID_RADII.includes(radiusParam as SearchRadiusMiles)
      ? (radiusParam as SearchRadiusMiles)
      : 5;

    // Validate parameters (reuse roof analysis schema for lat/lng)
    const validationResult = roofAnalysisParamsSchema.safeParse({ lat, lng });

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid coordinates provided" },
        { status: 400 }
      );
    }

    // Get nearby places from Google Places API
    const placesData = await getNearbyPlaces(lat, lng, radius);

    if (!placesData) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not retrieve nearby places for this location.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: placesData,
    });
  } catch (error) {
    console.error("Nearby places API error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch nearby places" },
      { status: 500 }
    );
  }
}
