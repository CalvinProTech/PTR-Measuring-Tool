import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isOwner } from "@/lib/auth";
import { z } from "zod";

const LOG_PREFIX = "[api/bulletins]";

const createBulletinSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  publishDate: z.string().datetime().optional(),
});

/**
 * GET /api/bulletins
 * Fetch bulletins for a given month with read status
 * Query params: ?month=2026-02 (defaults to current month)
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month"); // Format: "2026-02"

    // Validate month format if provided
    if (monthParam && !/^\d{4}-\d{2}$/.test(monthParam)) {
      return NextResponse.json(
        { success: false, error: "Invalid month format. Use YYYY-MM." },
        { status: 400 }
      );
    }

    // Calculate date range for the month
    const targetDate = monthParam ? new Date(monthParam + "-01") : new Date();
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid month value" },
        { status: 400 }
      );
    }
    const startOfMonth = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const bulletins = await prisma.bulletin.findMany({
      where: {
        publishDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        readStatuses: {
          where: { userId },
        },
      },
      orderBy: { publishDate: "desc" },
    });

    // Count total unread bulletins (across all time, not just this month)
    const unreadCount = await prisma.bulletin.count({
      where: {
        readStatuses: {
          none: { userId },
        },
      },
    });

    const data = bulletins.map((b) => ({
      id: b.id,
      title: b.title,
      content: b.content,
      publishDate: b.publishDate,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      createdBy: b.createdBy,
      isRead: b.readStatuses.length > 0,
    }));

    return NextResponse.json({
      success: true,
      data: { bulletins: data, unreadCount },
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} Error fetching bulletins:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch bulletins" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bulletins
 * Create a new bulletin. Owner only.
 */
export async function POST(request: Request) {
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
        { success: false, error: "Only owners can create bulletins" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = createBulletinSchema.parse(body);

    const bulletin = await prisma.bulletin.create({
      data: {
        title: validated.title.trim(),
        content: validated.content.trim(),
        publishDate: validated.publishDate
          ? new Date(validated.publishDate)
          : new Date(),
        createdBy: userId,
      },
    });

    console.log(`${LOG_PREFIX} Bulletin created:`, {
      id: bulletin.id,
      title: bulletin.title,
      createdBy: userId,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...bulletin,
        isRead: false,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error(`${LOG_PREFIX} Error creating bulletin:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: "Failed to create bulletin" },
      { status: 500 }
    );
  }
}
