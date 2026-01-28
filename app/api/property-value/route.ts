import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { PropertyValueResponse } from "@/types";

const RENTCAST_API_KEY = process.env.RENTCAST_API_KEY;
const RENTCAST_API_BASE = "https://api.rentcast.io/v1";

export async function GET(
  request: Request
): Promise<NextResponse<PropertyValueResponse>> {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get address from query params
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address is required" },
        { status: 400 }
      );
    }

    if (!RENTCAST_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Rentcast API key is not configured" },
        { status: 500 }
      );
    }

    // Call Rentcast API
    const url = `${RENTCAST_API_BASE}/avm/value?address=${encodeURIComponent(address)}`;

    const response = await fetch(url, {
      headers: {
        "X-Api-Key": RENTCAST_API_KEY,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: "Property value data not available for this address" },
          { status: 404 }
        );
      }
      throw new Error(`Rentcast API error: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        price: data.price,
        priceRangeLow: data.priceRangeLow,
        priceRangeHigh: data.priceRangeHigh,
        bedrooms: data.subjectProperty?.bedrooms,
        bathrooms: data.subjectProperty?.bathrooms,
        squareFootage: data.subjectProperty?.squareFootage,
        yearBuilt: data.subjectProperty?.yearBuilt,
        propertyType: data.subjectProperty?.propertyType,
      },
    });
  } catch (error) {
    console.error("Property value API error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to get property value";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
