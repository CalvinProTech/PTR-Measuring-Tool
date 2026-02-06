import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isOwner } from "@/lib/auth";
import { z } from "zod";

const LOG_PREFIX = "[api/bulletins/[id]]";

const updateBulletinSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  content: z.string().min(1).optional(),
  publishDate: z.string().datetime().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/bulletins/[id]
 * Update a bulletin. Owner only.
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { id } = await params;

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
        { success: false, error: "Only owners can update bulletins" },
        { status: 403 }
      );
    }

    // Check if bulletin exists
    const existing = await prisma.bulletin.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Bulletin not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = updateBulletinSchema.parse(body);

    const updateData: {
      title?: string;
      content?: string;
      publishDate?: Date;
    } = {};

    if (validated.title !== undefined) {
      updateData.title = validated.title.trim();
    }
    if (validated.content !== undefined) {
      updateData.content = validated.content.trim();
    }
    if (validated.publishDate !== undefined) {
      updateData.publishDate = new Date(validated.publishDate);
    }

    const bulletin = await prisma.bulletin.update({
      where: { id },
      data: updateData,
      include: {
        readStatuses: {
          where: { userId },
        },
      },
    });

    console.log(`${LOG_PREFIX} Bulletin updated:`, {
      id: bulletin.id,
      title: bulletin.title,
      updatedBy: userId,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: bulletin.id,
        title: bulletin.title,
        content: bulletin.content,
        publishDate: bulletin.publishDate,
        createdAt: bulletin.createdAt,
        updatedAt: bulletin.updatedAt,
        createdBy: bulletin.createdBy,
        isRead: bulletin.readStatuses.length > 0,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error(`${LOG_PREFIX} Error updating bulletin:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: "Failed to update bulletin" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bulletins/[id]
 * Delete a bulletin. Owner only.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { id } = await params;

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
        { success: false, error: "Only owners can delete bulletins" },
        { status: 403 }
      );
    }

    // Check if bulletin exists
    const existing = await prisma.bulletin.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Bulletin not found" },
        { status: 404 }
      );
    }

    // Delete bulletin (cascade will delete read statuses)
    await prisma.bulletin.delete({
      where: { id },
    });

    console.log(`${LOG_PREFIX} Bulletin deleted:`, {
      id: existing.id,
      title: existing.title,
      deletedBy: userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`${LOG_PREFIX} Error deleting bulletin:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: "Failed to delete bulletin" },
      { status: 500 }
    );
  }
}
