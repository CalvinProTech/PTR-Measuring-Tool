import { NextResponse } from "next/server";
import { getBuildingInsights } from "@/lib/google-apis";
import { roofAnalysisParamsSchema } from "@/lib/validations";
import type { RoofAnalysisResponse } from "@/types";

export async function GET(request: Request): Promise<NextResponse<RoofAnalysisResponse>> {
  try {
    // Note: Auth removed to support Salesforce embed which bypasses Clerk

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");

    // Validate parameters
    const validationResult = roofAnalysisParamsSchema.safeParse({ lat, lng });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid coordinates provided",
        },
        { status: 400 }
      );
    }

    // Get building insights from Solar API
    const roofData = await getBuildingInsights(lat, lng);

    if (!roofData) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not retrieve roof data for this location. The Solar API may not have coverage for this address.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: roofData,
    });
  } catch (error) {
    console.error("Roof analysis API error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to analyze roof" },
      { status: 500 }
    );
  }
}
