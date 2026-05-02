"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
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
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Interview room
          </p>
          <p className="truncate font-mono text-sm font-semibold tracking-tight">
            {roomId}
          </p>
        </div>
        <ParticipantAvatarStrip />
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={siteConfig.routes.dashboard}
            className="rounded-xl border border-white/15 px-3 py-2 text-xs font-medium text-muted transition hover:bg-white/5 hover:text-foreground"
          >
            Dashboard
          </Link>
          {media ? (
            <button
              type="button"
              onClick={() => media.leaveRoomToDashboard()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-400/35 bg-red-500/15 px-3 py-2 text-xs font-medium text-red-100 transition hover:bg-red-500/25"
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
        <div className="hidden lg:block">
          <RoomRightRail />
        </div>
      </div>

      <RoomVideoDock />
    </div>
  );
}
