import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isOwner, isValidRole, DEFAULT_ROLE } from "@/lib/auth";

const LOG_PREFIX = "[api/users]";

/** Maximum number of users to fetch per request */
const MAX_USERS_LIMIT = 100;

/**
 * GET /api/users
 * List all users. Owner only.
 *
 * @returns List of users with their roles
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.warn(`${LOG_PREFIX} Unauthorized access attempt`);
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is owner
    const ownerCheck = await isOwner();
    if (!ownerCheck) {
      console.warn(`${LOG_PREFIX} Non-owner attempted to access users list`, { userId });
      return NextResponse.json(
        { success: false, error: "Only owners can view users" },
        { status: 403 }
      );
    }

    const client = await clerkClient();
    const usersResponse = await client.users.getUserList({ limit: MAX_USERS_LIMIT });

    const users = usersResponse.data.map((user) => {
      const rawRole = user.publicMetadata?.role as string | undefined;
      const role = rawRole && isValidRole(rawRole) ? rawRole : DEFAULT_ROLE;

      return {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        role,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
      };
    });

    console.info(`${LOG_PREFIX} Fetched ${users.length} users`, { requestedBy: userId });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error(`${LOG_PREFIX} Error fetching users:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
