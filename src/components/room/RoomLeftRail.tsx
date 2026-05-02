"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, MonitorPlay, Terminal } from "lucide-react";

export function RoomLeftRail({ roomId }: { roomId: string }) {
  const pathname = usePathname();
  const base = `/room/${encodeURIComponent(roomId)}`;
  const items = [
    { href: `${base}/video`, label: "Video", icon: MonitorPlay },
    { href: `${base}/editor`, label: "Editor", icon: Code2 },
    { href: `${base}/compile`, label: "Compile", icon: Terminal },
  ];

  return (
    <nav
      className="flex w-14 shrink-0 flex-col gap-1 border-r border-white/10 bg-black/20 py-4"
      aria-label="Room modes"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
              active
                ? "border-teal-400/60 bg-teal-500/20 text-teal-200"
                : "border-transparent text-muted hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span className="sr-only">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
