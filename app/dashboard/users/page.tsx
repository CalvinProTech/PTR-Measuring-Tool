"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { UserData, UsersResponse, UserRole } from "@/types";

export default function UsersPage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Check if current user is owner
  const role = (user?.publicMetadata?.role as UserRole) || "agent";
  const isOwner = role === "owner";

  useEffect(() => {
    // Redirect non-owners once user data is loaded
    if (isUserLoaded && !isOwner) {
      router.push("/dashboard");
      return;
    }

    if (!isUserLoaded || !isOwner) {
      return;
    }

    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        const data: UsersResponse = await res.json();

        if (!data.success || !data.data) {
          throw new Error(data.error || "Failed to load users");
        }

        setUsers(data.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load users";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [isUserLoaded, isOwner, router]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to update role");
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update role";
      alert(message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (!isUserLoaded || isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return null;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage user roles. Owners have full access, agents can only search addresses.
        </p>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Sign In
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => {
              const isCurrentUser = u.id === user?.id;
              const displayName =
                u.firstName || u.lastName
                  ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
                  : u.email;

              return (
                <tr key={u.id} className={isCurrentUser ? "bg-primary-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={u.imageUrl}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {displayName}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-primary-600">(You)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        u.role === "owner"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.lastSignInAt
                      ? new Date(u.lastSignInAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isCurrentUser ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) =>
                          handleRoleChange(u.id, e.target.value as UserRole)
                        }
                        disabled={updatingUserId === u.id}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                      >
                        <option value="agent">Agent</option>
                        <option value="owner">Owner</option>
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}
