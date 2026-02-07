import { NextResponse } from "next/server";
import { getPopulationDensity } from "@/lib/census-api";
import { roofAnalysisParamsSchema } from "@/lib/validations";
import type { PopulationDensityResponse } from "@/types";

export async function GET(
  request: Request
): Promise<NextResponse<PopulationDensityResponse>> {
  try {
    // Note: Auth removed to support Salesforce embed which bypasses Clerk

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");

    const validationResult = roofAnalysisParamsSchema.safeParse({ lat, lng });
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid coordinates provided" },
        { status: 400 }
      );
    }

    const densityData = await getPopulationDensity(lat, lng);
    if (!densityData) {
      return NextResponse.json(
        {
          success: false,
          error: "Population density data not available for this location.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: densityData,
    });
  } catch (error) {
    console.error("Population density API error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch population density" },
      { status: 500 }
    );
  }
}
