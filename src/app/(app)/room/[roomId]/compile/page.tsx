"use client";

import { useParams } from "next/navigation";
import { CompileOutputPanel } from "@/components/room/CompileOutputPanel";
import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";

export default function RoomCompilePage() {
  const params = useParams();
  const roomId =
    typeof params.roomId === "string"
      ? params.roomId
      : Array.isArray(params.roomId)
        ? params.roomId[0]
        : "";

  const { wsState, compileResult, compileBusy, clearCompileResult } =
    useRoomSession();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <p className="text-sm text-muted">
        Output for the shared room run (
        <span className="font-mono text-xs">/topic/room/{roomId || "…"}/compile-result</span>
        ). Start a run from the editor tab; this view stays on the compile channel
        while you review <span className="text-foreground">pistonReachable</span>{" "}
        and stdout/stderr.
      </p>
      <CompileOutputPanel
        wsState={wsState}
        compileResult={compileResult}
        compileBusy={compileBusy}
        clearCompileResult={clearCompileResult}
        className="max-h-[min(520px,70vh)]"
      />
    </div>
  );
}
