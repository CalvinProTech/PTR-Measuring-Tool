import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isOwner } from "@/lib/auth";
import { del } from "@vercel/blob";

const LOG_PREFIX = "[api/training]";

/**
 * GET /api/training
 * Fetch all training documents
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

    const documents = await prisma.trainingDocument.findMany({
      orderBy: [{ category: "asc" }, { uploadedAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error(`${LOG_PREFIX} Error fetching training documents:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch training documents" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/training
 * Save training document metadata after client-side upload to Vercel Blob.
 * Owner only.
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
        { success: false, error: "Only owners can upload training documents" },
        { status: 403 }
      );
    }

    // Parse JSON body (metadata from client after blob upload)
    const body = await request.json();
    const { name, filename, blobUrl, type, category, description, fileSize } = body;

    // Validate required fields
    if (!blobUrl) {
      return NextResponse.json(
        { success: false, error: "Blob URL is required" },
        { status: 400 }
      );
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Document name is required" },
        { status: 400 }
      );
    }

    if (!category || category.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Category is required" },
        { status: 400 }
      );
    }

    // Create database record with blob URL
    const document = await prisma.trainingDocument.create({
      data: {
        name: name.trim(),
        filename: filename || "unknown",
        storedName: blobUrl, // Store the Vercel Blob URL
        type: type || "unknown",
        category: category.trim(),
        description: description?.trim() || null,
        fileSize: fileSize || 0,
        uploadedBy: userId,
      },
    });

    console.log(`${LOG_PREFIX} Document metadata saved:`, {
      id: document.id,
      name: document.name,
      blobUrl,
      uploadedBy: userId,
    });

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    console.error(`${LOG_PREFIX} Error saving training document:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: "Failed to save training document" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/training
 * Delete a training document from Vercel Blob. Owner only.
 * Expects JSON body: { id: string }
 */
export async function DELETE(request: Request) {
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
        { success: false, error: "Only owners can delete training documents" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Find the document
    const document = await prisma.trainingDocument.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete from Vercel Blob
    try {
      await del(document.storedName);
    } catch (blobError) {
      console.warn(`${LOG_PREFIX} Could not delete from Vercel Blob:`, blobError);
      // Continue with database deletion even if blob deletion fails
    }

    // Delete database record
    await prisma.trainingDocument.delete({
      where: { id },
    });

    console.log(`${LOG_PREFIX} Document deleted:`, {
      id: document.id,
      name: document.name,
      deletedBy: userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`${LOG_PREFIX} Error deleting training document:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: "Failed to delete training document" },
      { status: 500 }
    );
  }
}
