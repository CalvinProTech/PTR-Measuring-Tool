import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isOwner } from "@/lib/auth";
import { z } from "zod";

const LOG_PREFIX = "[api/settings/pricing]";

/** Maximum allowed rate to prevent division by zero in pricing calculations */
const MAX_RATE = 0.99;

const pricingSettingsSchema = z.object({
  costPerSqFt: z.number().min(0, "Cost per sq ft must be non-negative").max(1000, "Cost per sq ft seems unreasonably high"),
  targetProfit: z.number().min(0, "Target profit must be non-negative").max(100000, "Target profit seems unreasonably high"),
  commissionRate: z.number().min(0, "Commission rate must be non-negative").max(MAX_RATE, `Commission rate must be less than ${MAX_RATE}`),
  gutterPricePerFt: z.number().min(0, "Gutter price must be non-negative").max(500, "Gutter price seems unreasonably high"),
  tier1DealerFee: z.number().min(0, "Tier 1 fee must be non-negative").max(MAX_RATE, `Tier 1 fee must be less than ${MAX_RATE}`),
  tier2DealerFee: z.number().min(0, "Tier 2 fee must be non-negative").max(MAX_RATE, `Tier 2 fee must be less than ${MAX_RATE}`),
  tier3DealerFee: z.number().min(0, "Tier 3 fee must be non-negative").max(MAX_RATE, `Tier 3 fee must be less than ${MAX_RATE}`),
});

/**
 * GET /api/settings/pricing
 * Fetch current pricing settings. Creates default if none exists.
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the first (and only) pricing settings record, or create default
    let settings = await prisma.pricingSettings.findFirst();

    if (!settings) {
      // Create default settings
      settings = await prisma.pricingSettings.create({
        data: {
          costPerSqFt: 4.5,
          targetProfit: 2000,
          commissionRate: 0.1,
          gutterPricePerFt: 15.0,
          tier1DealerFee: 0,
          tier2DealerFee: 0.1,
          tier3DealerFee: 0.15,
        },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error(`${LOG_PREFIX} Error fetching pricing settings:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch pricing settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings/pricing
 * Update pricing settings. Owner only.
 */
export async function PUT(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is owner
    const ownerCheck = await isOwner();
    if (!ownerCheck) {
      return NextResponse.json(
        { success: false, error: "Only owners can update pricing settings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = pricingSettingsSchema.parse(body);

    // Get existing settings or create new
    let settings = await prisma.pricingSettings.findFirst();

    if (settings) {
      // Update existing
      settings = await prisma.pricingSettings.update({
        where: { id: settings.id },
        data: {
          ...validatedData,
          updatedBy: userId,
        },
      });
    } else {
      // Create new
      settings = await prisma.pricingSettings.create({
        data: {
          ...validatedData,
          updatedBy: userId,
        },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn(`${LOG_PREFIX} Validation error:`, error.errors);
      return NextResponse.json(
        { success: false, error: "Invalid pricing data", details: error.errors },
        { status: 400 }
      );
    }

    console.error(`${LOG_PREFIX} Error updating pricing settings:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: "Failed to update pricing settings" },
      { status: 500 }
    );
  }
}
