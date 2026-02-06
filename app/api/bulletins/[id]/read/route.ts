import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

const LOG_PREFIX = "[api/bulletins/[id]/read]";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/bulletins/[id]/read
 * Mark a bulletin as read for the current user.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if bulletin exists
    const bulletin = await prisma.bulletin.findUnique({
      where: { id },
    });

    if (!bulletin) {
      return NextResponse.json(
        { success: false, error: "Bulletin not found" },
        { status: 404 }
      );
    }

    // Create or update read status (upsert)
    await prisma.bulletinReadStatus.upsert({
      where: {
        bulletinId_userId: {
          bulletinId: id,
          userId,
        },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        bulletinId: id,
        userId,
      },
    });

    console.log(`${LOG_PREFIX} Bulletin marked as read:`, {
      bulletinId: id,
      userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`${LOG_PREFIX} Error marking bulletin as read:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: "Failed to mark bulletin as read" },
      { status: 500 }
    );
  }
}
