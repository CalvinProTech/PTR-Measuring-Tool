"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import type { UserRole } from "@/types";

export function Header() {
  const pathname = usePathname();
  const { user } = useUser();

  const role = (user?.publicMetadata?.role as UserRole) || "agent";
  const isOwner = role === "owner";

  const isActive = (path: string) => pathname === path;

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors duration-200 rounded-lg px-3 py-1.5 ${
      isActive(path)
        ? "bg-primary-50 text-primary-700"
        : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
    }`;

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 opacity-20 blur-sm" />
              <Image
                src="/company-logo.jpg"
                alt="ProTech Roofing"
                width={36}
                height={36}
                className="relative rounded-lg"
              />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-neutral-800">
              ProTech Roofing
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <Link href="/dashboard" className={navLinkClass("/dashboard")}>
              Estimates
            </Link>
            <Link
              href="/dashboard/training"
              className={navLinkClass("/dashboard/training")}
            >
              Training
            </Link>
            {isOwner && (
              <>
                <Link
                  href="/dashboard/users"
                  className={navLinkClass("/dashboard/users")}
                >
                  Users
                </Link>
                <Link
                  href="/dashboard/settings"
                  className={navLinkClass("/dashboard/settings")}
                >
                  Settings
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/training"
            className="sm:hidden p-2 text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
            title="Training"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </Link>
          {isOwner && (
            <>
              <Link
                href="/dashboard/users"
                className="sm:hidden p-2 text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
                title="Users"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </Link>
              <Link
                href="/dashboard/settings"
                className="sm:hidden p-2 text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
                title="Settings"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>
            </>
          )}
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
