import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getBuildingInsights } from "@/lib/google-apis";
import { roofAnalysisParamsSchema } from "@/lib/validations";
import type { RoofAnalysisResponse } from "@/types";

export async function GET(request: Request): Promise<NextResponse<RoofAnalysisResponse>> {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

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
