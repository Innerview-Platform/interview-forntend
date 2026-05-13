"use client";

import { Video, X } from "lucide-react";
import { useState } from "react";
import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";
import { RoomVideoPanel } from "@/components/room/RoomVideoPanel";

/** Slim strip + expandable panel - video only (lg+ in `RoomShell`). */
export function RoomRightRail() {
  const [panelOpen, setPanelOpen] = useState(false);
  const { joinError } = useRoomSession();

  const stripBtn = (active: boolean) =>
    `flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
      active
        ? "border-accent/50 bg-accent/15 text-violet-100"
        : "border-transparent text-muted hover:bg-white/5 hover:text-foreground"
    }`;

  return (
    <div className="flex h-full min-h-0 shrink-0">
      <nav
        className="flex w-11 shrink-0 flex-col items-center gap-1 border-l border-white/10 bg-surface/50 py-2"
        aria-label="Room video"
      >
        <button
          type="button"
          title="Video"
          className={stripBtn(panelOpen)}
          onClick={() => setPanelOpen((o) => !o)}
        >
          <Video className="h-5 w-5" aria-hidden />
          <span className="sr-only">Video</span>
        </button>
      </nav>

      {panelOpen ? (
        <aside className="flex w-[min(320px,82vw)] shrink-0 flex-col border-l border-white/10 bg-background/92">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-2 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
              Video
            </p>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-foreground"
              title="Collapse"
              aria-label="Collapse sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden p-2">
            <RoomVideoPanel variant="embedded" joinError={joinError} />
          </div>
        </aside>
      ) : null}
    </div>
  );
}
