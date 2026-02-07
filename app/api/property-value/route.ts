import { NextResponse } from "next/server";
import { checkRateLimit, incrementRateLimit, getRateLimitStatus } from "@/lib/rate-limiter";
import type { PropertyValueResponse } from "@/types";

const RENTCAST_API_KEY = process.env.RENTCAST_API_KEY;
const RENTCAST_API_BASE = "https://api.rentcast.io/v1";
const RENTCAST_RATE_LIMIT = 50; // Max requests per month

export async function GET(
  request: Request
): Promise<NextResponse<PropertyValueResponse>> {
  try {
    // Note: Auth removed to support Salesforce embed which bypasses Clerk

    // Check rate limit before making API call
    const rateLimit = checkRateLimit("rentcast", RENTCAST_RATE_LIMIT);
    if (!rateLimit.allowed) {
      const status = getRateLimitStatus("rentcast", RENTCAST_RATE_LIMIT);
      console.warn(`Rentcast rate limit exceeded: ${status.count}/${status.limit} requests used`);
      return NextResponse.json(
        {
          success: false,
          error: `Monthly API limit reached (${RENTCAST_RATE_LIMIT} requests). Resets ${rateLimit.resetAt.toLocaleDateString()}.`
        },
        { status: 429 }
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);
    const response = await fetch(url, {
      headers: { "X-Api-Key": RENTCAST_API_KEY },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

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

    // Increment rate limit counter after successful API call
    incrementRateLimit("rentcast");
    const status = getRateLimitStatus("rentcast", RENTCAST_RATE_LIMIT);
    console.log(`Rentcast API call successful. Usage: ${status.count}/${status.limit} requests`);

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

    return NextResponse.json(
      { success: false, error: "Failed to get property value" },
      { status: 500 }
    );
  }
}
