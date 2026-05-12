"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Code2, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ParticipantAvatarStrip } from "@/components/room/ParticipantAvatarStrip";
import { RoomLeftRail } from "@/components/room/RoomLeftRail";
import { RoomRightRail } from "@/components/room/RoomRightRail";
import { RoomVideoDock } from "@/components/room/RoomVideoDock";
import { siteConfig } from "@/lib/site-config";
import { useRoomMediaOptional } from "@/app/(app)/room/[roomId]/room-media-context";

export function RoomShell({
  roomId,
  children,
}: {
  roomId: string;
  children: ReactNode;
}) {
  const media = useRoomMediaOptional();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-white/10 bg-background/90 px-4 py-3 backdrop-blur-xl">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-accent sm:flex">
            <Code2 className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Interview room
          </p>
          <p className="truncate font-mono text-sm font-semibold tracking-tight text-muted-strong">
            {roomId}
          </p>
          </div>
        </div>
        <ParticipantAvatarStrip />
        <Badge tone="success" className="hidden sm:inline-flex">Live workspace</Badge>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={siteConfig.routes.dashboard}
            className="rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-muted transition hover:bg-white/5 hover:text-foreground"
          >
            Dashboard
          </Link>
          {media ? (
            <button
              type="button"
              onClick={() => media.leaveRoomToDashboard()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-danger/35 bg-danger/15 px-3 py-2 text-xs font-medium text-rose-100 transition hover:bg-danger/25"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Leave room
            </button>
          ) : null}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <RoomLeftRail roomId={roomId} />
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 sm:p-4">
          {children}
        </main>
        <div className="hidden min-h-0 lg:flex lg:shrink-0">
          <RoomRightRail />
        </div>
      </div>

      <RoomVideoDock />
    </div>
  );
}
