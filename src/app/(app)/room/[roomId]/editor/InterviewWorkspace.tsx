"use client";

import GridLayout, {
  useContainerWidth,
  verticalCompactor,
  type Layout,
  type LayoutItem,
} from "react-grid-layout";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SharedCanvas } from "@/components/room/SharedCanvas";
import { SharedMonacoEditor } from "@/components/room/SharedMonacoEditor";
import { CompileOutputPanel } from "@/components/room/CompileOutputPanel";
import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const LAYOUT_KEYS = new Set(["canvas", "editor", "console"]);

function workspaceStorageKey(roomId: string): string {
  return `innerview:roomWorkspaceLayout:v1:${encodeURIComponent(roomId)}`;
}

const DEFAULT_LAYOUT: Layout = [
  { i: "editor", x: 0, y: 0, w: 8, h: 12, minW: 4, minH: 6 },
  { i: "canvas", x: 8, y: 0, w: 4, h: 12, minW: 3, minH: 5 },
  { i: "console", x: 0, y: 12, w: 12, h: 5, minW: 4, minH: 3 },
];

function isLayoutItem(v: unknown): v is LayoutItem {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.i === "string" &&
    LAYOUT_KEYS.has(o.i) &&
    typeof o.x === "number" &&
    typeof o.y === "number" &&
    typeof o.w === "number" &&
    typeof o.h === "number"
  );
}

function parseStoredLayout(raw: string | null): Layout | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return null;
    const items = data.filter(isLayoutItem);
    const ids = new Set(items.map((x) => x.i));
    if (ids.size !== LAYOUT_KEYS.size) return null;
    for (const k of LAYOUT_KEYS) {
      if (!ids.has(k)) return null;
    }
    return items;
  } catch {
    return null;
  }
}

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

function BlockHeader({ title }: { title: string }) {
  return (
    <div className="workspace-drag-handle flex shrink-0 cursor-grab items-center gap-2 border-b border-white/10 bg-surface/70 px-2.5 py-1.5 active:cursor-grabbing">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
        {title}
      </span>
    </div>
  );
}

export function InterviewWorkspace({ roomId }: { roomId: string }) {
  const { wsState, compileResult, compileBusy, clearCompileResult } =
    useRoomSession();
  const { width, containerRef, mounted } = useContainerWidth();
  const lg = useLgBreakpoint();

  const [layout, setLayout] = useState<Layout>(() => {
    if (typeof window === "undefined") return DEFAULT_LAYOUT;
    return parseStoredLayout(localStorage.getItem(workspaceStorageKey(roomId))) ??
      DEFAULT_LAYOUT;
  });

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistLayout = useCallback(
    (next: Layout) => {
      if (typeof window === "undefined") return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveTimer.current = null;
        try {
          localStorage.setItem(
            workspaceStorageKey(roomId),
            JSON.stringify(next),
          );
        } catch {
          /* quota / private mode */
        }
      }, 320);
    },
    [roomId],
  );

  const onLayoutChange = useCallback(
    (next: Layout) => {
      setLayout(next);
      persistLayout(next);
    },
    [persistLayout],
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const parsed = parseStoredLayout(
      localStorage.getItem(workspaceStorageKey(roomId)),
    );
    if (parsed) setLayout(parsed);
  }, [roomId]);

  const gridConfig = useMemo(
    () => ({
      cols: 12,
      rowHeight: 34,
      margin: [8, 8] as const,
      containerPadding: [0, 0] as const,
      maxRows: Infinity as number,
    }),
    [],
  );

  const dragConfig = useMemo(
    () => ({
      enabled: true,
      handle: ".workspace-drag-handle",
      cancel: "input,textarea,button,select,.monaco-editor,.tl-container",
      bounded: false,
    }),
    [],
  );

  const resizeConfig = useMemo(
    () => ({
      enabled: true,
      handles: ["se", "s", "e"] as const,
    }),
    [],
  );

  if (!lg) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
        <section className="flex min-h-[min(280px,42vh)] min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#080c14]">
          <BlockHeader title="Code" />
          <div className="min-h-0 flex-1">
            <SharedMonacoEditor />
          </div>
        </section>
        <section className="flex min-h-[min(260px,40vh)] min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#080c14]">
          <div className="flex shrink-0 border-b border-white/10 bg-surface/70 px-2.5 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Live canvas
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <SharedCanvas />
          </div>
        </section>
        <section className="flex min-h-[200px] min-w-0 flex-col">
          <CompileOutputPanel
            wsState={wsState}
            compileResult={compileResult}
            compileBusy={compileBusy}
            clearCompileResult={clearCompileResult}
            className="h-full min-h-0 max-h-none flex-1"
          />
        </section>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-0 min-w-0 flex-1"
    >
      {mounted && width > 0 ? (
        <GridLayout
          width={width}
          layout={layout}
          onLayoutChange={onLayoutChange}
          gridConfig={gridConfig}
          dragConfig={dragConfig}
          resizeConfig={resizeConfig}
          compactor={verticalCompactor}
          className="min-h-[min(560px,calc(100dvh-12rem))]"
        >
          <div
            key="editor"
            className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#080c14]"
          >
            <BlockHeader title="Code" />
            <div className="min-h-0 flex-1 overflow-hidden">
              <SharedMonacoEditor />
            </div>
          </div>
          <div
            key="canvas"
            className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#f8f9fa]"
          >
            <BlockHeader title="Live canvas" />
            <div className="min-h-0 flex-1 overflow-hidden">
              <SharedCanvas />
            </div>
          </div>
          <div key="console" className="flex flex-col overflow-hidden">
            <CompileOutputPanel
              wsState={wsState}
              compileResult={compileResult}
              compileBusy={compileBusy}
              clearCompileResult={clearCompileResult}
              className="h-full min-h-0 max-h-none flex-1 rounded-xl border border-white/10"
            />
          </div>
        </GridLayout>
      ) : null}
    </div>
  );
}
