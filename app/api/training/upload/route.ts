import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isOwner } from "@/lib/auth";

/**
 * POST /api/training/upload
 * Handles client-side upload tokens for Vercel Blob
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Authenticate user
        const { userId } = await auth();
        if (!userId) {
          throw new Error("Unauthorized");
        }

        // Check if user is owner
        const ownerCheck = await isOwner();
        if (!ownerCheck) {
          throw new Error("Only owners can upload training documents");
        }

        return {
          allowedContentTypes: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "image/png",
            "image/jpeg",
            "image/gif",
            "audio/mpeg",
            "audio/wav",
            "video/mp4",
            "video/quicktime",
          ],
          maximumSizeInBytes: 200 * 1024 * 1024, // 200MB
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // This is called after the file is uploaded to Vercel Blob
        // We don't need to do anything here - the client will handle saving to DB
        console.log("[api/training/upload] Upload completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("[api/training/upload] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 }
    );
  }
}
