"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
          <p className="mt-4 text-sm text-neutral-500">Loading users...</p>
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
        <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-red-50/50 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-800">Error loading users</h3>
              <p className="mt-0.5 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-neutral-800">User Management</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage user roles. Owners have full access, agents can only search addresses.
        </p>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Last Sign In
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {users.map((u) => {
              const isCurrentUser = u.id === user?.id;
              const displayName =
                u.firstName || u.lastName
                  ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
                  : u.email;

              return (
                <tr
                  key={u.id}
                  className={`transition-colors ${
                    isCurrentUser
                      ? "bg-primary-50/50 border-l-4 border-l-primary-400"
                      : "hover:bg-primary-50/30"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="relative h-10 w-10 flex-shrink-0">
                        <Image
                          className="rounded-full ring-2 ring-neutral-100"
                          src={u.imageUrl}
                          alt={`${displayName}'s avatar`}
                          fill
                          sizes="40px"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-800">
                          {displayName}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs font-semibold text-primary-600">(You)</span>
                          )}
                        </div>
                        <div className="text-sm text-neutral-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 ${
                        u.role === "owner"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        u.role === "owner" ? "bg-purple-500" : "bg-emerald-500"
                      }`} />
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {u.lastSignInAt
                      ? new Date(u.lastSignInAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isCurrentUser ? (
                      <span className="text-neutral-300">-</span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) =>
                          handleRoleChange(u.id, e.target.value as UserRole)
                        }
                        disabled={updatingUserId === u.id}
                        className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-sm shadow-sm transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
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
          <div className="px-6 py-12 text-center text-neutral-500">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}
