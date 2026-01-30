import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isOwner, VALID_ROLES } from "@/lib/auth";
import { z } from "zod";

const LOG_PREFIX = "[api/users/role]";

const roleSchema = z.object({
  role: z.enum(["owner", "agent"], {
    errorMap: () => ({ message: `Role must be one of: ${VALID_ROLES.join(", ")}` }),
  }),
});

/**
 * PUT /api/users/[userId]/role
 * Update a user's role. Owner only.
 *
 * @param request - The request containing the new role
 * @param params - URL parameters containing the target userId
 * @returns Success/failure response
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: currentUserId } = await auth();
    const { userId: targetUserId } = await params;

    if (!currentUserId) {
      console.warn(`${LOG_PREFIX} Unauthorized access attempt`);
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate targetUserId is provided
    if (!targetUserId || typeof targetUserId !== "string" || targetUserId.trim() === "") {
      console.warn(`${LOG_PREFIX} Invalid target user ID`, { targetUserId });
      return NextResponse.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Check if user is owner
    const ownerCheck = await isOwner();
    if (!ownerCheck) {
      console.warn(`${LOG_PREFIX} Non-owner attempted to update role`, {
        currentUserId,
        targetUserId,
      });
      return NextResponse.json(
        { success: false, error: "Only owners can update roles" },
        { status: 403 }
      );
    }

    // Prevent owner from changing their own role (safety measure)
    if (currentUserId === targetUserId) {
      console.warn(`${LOG_PREFIX} Owner attempted to change own role`, { currentUserId });
      return NextResponse.json(
        { success: false, error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role } = roleSchema.parse(body);

    const client = await clerkClient();

    // Verify target user exists before updating
    try {
      await client.users.getUser(targetUserId);
    } catch {
      console.warn(`${LOG_PREFIX} Target user not found`, { targetUserId });
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    await client.users.updateUserMetadata(targetUserId, {
      publicMetadata: { role },
    });

    console.info(`${LOG_PREFIX} Role updated successfully`, {
      targetUserId,
      newRole: role,
      updatedBy: currentUserId,
    });

    return NextResponse.json({ success: true, data: { userId: targetUserId, role } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn(`${LOG_PREFIX} Validation error:`, error.errors);
      return NextResponse.json(
        { success: false, error: "Invalid role. Must be 'owner' or 'agent'" },
        { status: 400 }
      );
    }

    console.error(`${LOG_PREFIX} Error updating user role:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
