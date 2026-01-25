import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { geocodeAddress } from "@/lib/google-apis";
import { addressSchema } from "@/lib/validations";
import type { GeocodeResponse } from "@/types";

export async function POST(request: Request): Promise<NextResponse<GeocodeResponse>> {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = addressSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error.errors[0]?.message || "Invalid address",
        },
        { status: 400 }
      );
    }

    const { address } = validationResult.data;

    // Geocode the address
    const result = await geocodeAddress(address);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not find the address. Please check and try again.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Geocode API error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to geocode address";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
