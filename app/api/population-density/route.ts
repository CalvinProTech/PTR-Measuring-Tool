import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPopulationDensity } from "@/lib/census-api";
import { roofAnalysisParamsSchema } from "@/lib/validations";
import type { PopulationDensityResponse } from "@/types";

export async function GET(
  request: Request
): Promise<NextResponse<PopulationDensityResponse>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

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
