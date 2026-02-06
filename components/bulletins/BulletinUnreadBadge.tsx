"use client";

interface BulletinUnreadBadgeProps {
  count: number;
}

export function BulletinUnreadBadge({ count }: BulletinUnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-medium">
      {count > 99 ? "99+" : count}
    </span>
  );
}
