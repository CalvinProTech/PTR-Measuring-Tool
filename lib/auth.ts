import { auth, currentUser } from "@clerk/nextjs/server";
import type { UserRole } from "@/types";

/** Valid user roles */
export const VALID_ROLES: readonly UserRole[] = ["owner", "agent"] as const;

/** Default role for users without explicit role assignment */
export const DEFAULT_ROLE: UserRole = "agent";

/**
 * Get the current user's role from Clerk public metadata.
 * Defaults to "agent" if no role is set or if user is not authenticated.
 *
 * @returns The user's role, defaulting to "agent"
 */
export async function getUserRole(): Promise<UserRole> {
  try {
    const user = await currentUser();

    if (!user) {
      return DEFAULT_ROLE;
    }

    const role = user.publicMetadata?.role as UserRole | undefined;

    // Validate role is one of the valid roles
    if (role && VALID_ROLES.includes(role)) {
      return role;
    }

    return DEFAULT_ROLE;
  } catch (error) {
    console.error("[auth] Error fetching user role:", error);
    return DEFAULT_ROLE;
  }
}

/**
 * Check if the current user is an owner/admin.
 *
 * @returns true if the user has the "owner" role
 */
export async function isOwner(): Promise<boolean> {
  const role = await getUserRole();
  return role === "owner";
}

/**
 * Check if the current user is an agent.
 *
 * @returns true if the user has the "agent" role
 */
export async function isAgent(): Promise<boolean> {
  const role = await getUserRole();
  return role === "agent";
}

/**
 * Get the current user's ID from Clerk auth.
 *
 * @returns The user ID if authenticated, null otherwise
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId;
  } catch (error) {
    console.error("[auth] Error fetching user ID:", error);
    return null;
  }
}

/**
 * Validates that a role string is a valid UserRole.
 *
 * @param role - The role string to validate
 * @returns true if the role is valid
 */
export function isValidRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole);
}
