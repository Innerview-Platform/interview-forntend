"use client";

import { useState } from "react";
import type { CompileResultPayload } from "@/lib/compile-result";
import { CompileOutputPanel } from "@/components/room/CompileOutputPanel";
import { RoomSubmissionsPanel } from "@/components/room/RoomSubmissionsPanel";

type WsState = "off" | "connecting" | "connected";

type Props = {
  wsState: WsState;
  compileResult: CompileResultPayload | null;
  compileBusy: boolean;
  clearCompileResult: () => void;
  className?: string;
};

export function RoomInterviewConsole({
  wsState,
  compileResult,
  compileBusy,
  clearCompileResult,
  className,
}: Props) {
  const [tab, setTab] = useState<"run" | "judge">("run");

  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#080c14] ${className ?? ""}`}
    >
      <div className="flex shrink-0 gap-1 border-b border-white/10 bg-surface/65 px-2 py-1.5">
        <button
          type="button"
          onClick={() => setTab("run")}
          className={`rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition ${
            tab === "run"
              ? "bg-accent/25 text-foreground"
              : "text-muted hover:bg-white/5 hover:text-foreground"
          }`}
        >
          Piston run
        </button>
        <button
          type="button"
          onClick={() => setTab("judge")}
          className={`rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition ${
            tab === "judge"
              ? "bg-accent/25 text-foreground"
              : "text-muted hover:bg-white/5 hover:text-foreground"
          }`}
        >
          Session judge
        </button>
      </div>

      <div className="flex min-h-[200px] flex-1 flex-col overflow-hidden">
        {tab === "run" ? (
          <CompileOutputPanel
            wsState={wsState}
            compileResult={compileResult}
            compileBusy={compileBusy}
            clearCompileResult={clearCompileResult}
            className="h-full max-h-none min-h-0 flex-1 rounded-none border-0"
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <RoomSubmissionsPanel />
          </div>
        )}
      </div>
    </div>
  );
}
