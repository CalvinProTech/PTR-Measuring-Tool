import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isOwner } from "@/lib/auth";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const LOG_PREFIX = "[api/training]";

/** Directory where training documents are stored */
const UPLOADS_DIR = path.join(process.cwd(), "public", "training", "uploads");

/** Allowed file extensions */
const ALLOWED_EXTENSIONS = [
  "pdf",
  "docx",
  "xlsx",
  "pptx",
  "doc",
  "xls",
  "ppt",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "mp3",
  "mp4",
  "wav",
];

/** Maximum file size (200MB) */
const MAX_FILE_SIZE = 200 * 1024 * 1024;

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
 * Upload a new training document. Owner only.
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string | null;
    const category = formData.get("category") as string | null;
    const description = formData.get("description") as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
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

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 200MB limit" },
        { status: 400 }
      );
    }

    // Validate file extension
    const originalFilename = file.name;
    const extension = originalFilename.split(".").pop()?.toLowerCase() || "";

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        {
          success: false,
          error: `File type .${extension} is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    if (!existsSync(UPLOADS_DIR)) {
      await mkdir(UPLOADS_DIR, { recursive: true });
    }

    // Generate unique filename to avoid collisions
    const timestamp = Date.now();
    const sanitizedName = originalFilename
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .substring(0, 100);
    const storedName = `${timestamp}_${sanitizedName}`;
    const filePath = path.join(UPLOADS_DIR, storedName);

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Create database record
    const document = await prisma.trainingDocument.create({
      data: {
        name: name.trim(),
        filename: originalFilename,
        storedName,
        type: extension,
        category: category.trim(),
        description: description?.trim() || null,
        fileSize: file.size,
        uploadedBy: userId,
      },
    });

    console.log(`${LOG_PREFIX} Document uploaded:`, {
      id: document.id,
      name: document.name,
      filename: document.filename,
      uploadedBy: userId,
    });

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    console.error(`${LOG_PREFIX} Error uploading training document:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: "Failed to upload training document" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/training
 * Delete a training document. Owner only.
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

    // Delete file from disk
    const filePath = path.join(UPLOADS_DIR, document.storedName);
    try {
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (fileError) {
      console.warn(`${LOG_PREFIX} Could not delete file from disk:`, fileError);
      // Continue with database deletion even if file deletion fails
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
