"use client";

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { useEffect, useMemo, useState } from "react";
import { SharedCanvas } from "@/components/room/SharedCanvas";
import { SharedMonacoEditor } from "@/components/room/SharedMonacoEditor";
import { RoomInterviewConsole } from "@/components/room/RoomInterviewConsole";
import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";

/** Per-room keys for react-resizable-panels autoSave (see library: `react-resizable-panels:${id}`). */
function autoSaveIds(roomId: string) {
  const safe = encodeURIComponent(roomId);
  return {
    vertical: `innerview-ws-v2-vert-${safe}`,
    horizontal: `innerview-ws-v2-horiz-${safe}`,
  } as const;
}

/** Default split: workspace vs console, then editor vs canvas (percentages). */
const DEFAULT_VERTICAL: [number, number] = [70, 30];
const DEFAULT_HORIZONTAL: [number, number] = [64, 36];

function useLgBreakpoint(): boolean {
  const [lg, setLg] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const fn = () => setLg(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return lg;
}

export function InterviewWorkspace({ roomId }: { roomId: string }) {
  const { wsState, compileResult, compileBusy, clearCompileResult } =
    useRoomSession();
  const lg = useLgBreakpoint();
  const ids = useMemo(() => autoSaveIds(roomId), [roomId]);

  if (!lg) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
        <section className="flex min-h-[min(280px,42vh)] min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#080c14]">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <SharedMonacoEditor />
          </div>
        </section>
        <section className="flex min-h-[min(260px,40vh)] min-w-0 flex-col overflow-visible rounded-xl border border-white/10 bg-[#f8f9fa]">
          <div className="flex min-h-0 flex-1 flex-col overflow-visible">
            <SharedCanvas />
          </div>
        </section>
        <section className="flex min-h-[200px] min-w-0 flex-col">
          <RoomInterviewConsole
            wsState={wsState}
            compileResult={compileResult}
            compileBusy={compileBusy}
            clearCompileResult={clearCompileResult}
            className="h-full min-h-0 flex-1"
          />
        </section>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <PanelGroup
        direction="vertical"
        autoSaveId={ids.vertical}
        className="flex min-h-[min(560px,calc(100dvh-12rem))] min-w-0 flex-1"
        style={{ overflow: "visible" }}
      >
        <Panel
          defaultSize={DEFAULT_VERTICAL[0]}
          minSize={38}
          className="flex min-h-0 min-w-0 flex-col"
          style={{ overflow: "visible" }}
        >
          <PanelGroup
            direction="horizontal"
            autoSaveId={ids.horizontal}
            className="flex h-full min-h-0 min-w-0 flex-1"
            style={{ overflow: "visible" }}
          >
            <Panel
              defaultSize={DEFAULT_HORIZONTAL[0]}
              minSize={30}
              className="flex min-h-0 min-w-0 flex-col rounded-xl border border-white/10 bg-[#080c14]"
              style={{ overflow: "hidden" }}
            >
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <SharedMonacoEditor />
              </div>
            </Panel>

            <PanelResizeHandle className="group relative mx-1 w-2 shrink-0 bg-transparent outline-none after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-white/15 after:transition-colors hover:after:bg-accent/50 focus-visible:after:bg-accent/60" />

            <Panel
              defaultSize={DEFAULT_HORIZONTAL[1]}
              minSize={20}
              className="flex min-h-0 min-w-0 flex-col rounded-xl border border-white/10 bg-[#f8f9fa]"
              style={{ overflow: "visible" }}
            >
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-visible">
                <SharedCanvas />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>

        <PanelResizeHandle className="group relative my-1 h-2 shrink-0 bg-transparent outline-none after:absolute after:inset-x-0 after:top-1/2 after:h-1 after:-translate-y-1/2 after:rounded-full after:bg-white/15 after:transition-colors hover:after:bg-accent/50 focus-visible:after:bg-accent/60" />

        <Panel
          defaultSize={DEFAULT_VERTICAL[1]}
          minSize={16}
          className="flex min-h-0 min-w-0 flex-col overflow-hidden"
        >
          <RoomInterviewConsole
            wsState={wsState}
            compileResult={compileResult}
            compileBusy={compileBusy}
            clearCompileResult={clearCompileResult}
            className="h-full min-h-0 flex-1"
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}
