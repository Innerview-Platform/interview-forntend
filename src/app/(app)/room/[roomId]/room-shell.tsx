"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";

export function RoomShell({
  roomId,
  children,
}: {
  roomId: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const base = `/room/${encodeURIComponent(roomId)}`;
  const tabs = [
    { href: `${base}/editor`, label: "Editor" },
    { href: `${base}/compile`, label: "Compile / Test" },
    { href: `${base}/video`, label: "Video" },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-8 sm:px-5">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Live room
          </p>
          <h1 className="mt-1 font-mono text-xl font-semibold tracking-tight text-foreground">
            {roomId}
          </h1>
        </div>
        <Link
          href={siteConfig.routes.dashboard}
          className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          Back to dashboard
        </Link>
      </div>

      <nav
        className="mb-8 flex flex-wrap gap-1 border-b border-white/10"
        aria-label="Room sections"
      >
        {tabs.map((t) => {
          const active =
            pathname === t.href || pathname.startsWith(`${t.href}/`);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
