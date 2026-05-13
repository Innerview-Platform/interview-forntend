"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor, TLEditorSnapshot } from "tldraw";
import { loadSnapshot } from "tldraw";
import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";
import { Badge } from "@/components/ui/Badge";

const Tldraw = dynamic(async () => (await import("tldraw")).Tldraw, {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center text-sm text-muted">
      Loading canvas…
    </div>
  ),
});

export function SharedCanvas() {
  const { wsState, canvasSnapshotJson, canvasRemoteVersion, sendCanvasUpdate } =
    useRoomSession();
  const editorRef = useRef<Editor | null>(null);
  const isApplyingRemote = useRef(false);
  const [editorEpoch, setEditorEpoch] = useState(0);
  const lastAppliedDocJson = useRef<string>("");

  useEffect(() => {
    void import("tldraw/tldraw.css");
  }, []);

  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    if (!canvasSnapshotJson.trim()) {
      lastAppliedDocJson.current = "";
      return;
    }
    if (canvasSnapshotJson === lastAppliedDocJson.current) return;
    isApplyingRemote.current = true;
    try {
      const parsed = JSON.parse(canvasSnapshotJson) as unknown;
      if (!parsed || typeof parsed !== "object") return;
      const o = parsed as Record<string, unknown>;
      // Legacy: full editor snapshot (document + session) — overwrites presence.
      if ("document" in o && "session" in o) {
        loadSnapshot(ed.store, o as unknown as TLEditorSnapshot);
      } else {
        // Current: TLStoreSnapshot JSON at root → merge document only, keep local session/presence.
        loadSnapshot(ed.store, { document: o as never });
      }
      lastAppliedDocJson.current = canvasSnapshotJson;
    } catch {
      /* ignore malformed snapshots */
    } finally {
      queueMicrotask(() => {
        isApplyingRemote.current = false;
      });
    }
  }, [canvasRemoteVersion, canvasSnapshotJson, editorEpoch]);

  const onMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;
      setEditorEpoch((n) => n + 1);
      let debounce: ReturnType<typeof setTimeout> | null = null;
      const unsub = editor.store.listen(
        () => {
          if (isApplyingRemote.current) return;
          if (debounce) clearTimeout(debounce);
          debounce = setTimeout(() => {
            debounce = null;
            try {
              const doc = editor.getSnapshot().document;
              sendCanvasUpdate(JSON.stringify(doc));
            } catch {
              /* session / store not ready */
            }
          }, 300);
        },
        { source: "user", scope: "document" },
      );
      return () => {
        unsub();
        if (debounce) clearTimeout(debounce);
      };
    },
    [sendCanvasUpdate],
  );

  const statusLabel =
    wsState === "connected"
      ? "Live"
      : wsState === "connecting"
        ? "Connecting…"
        : "Offline";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#080c14]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-surface/65 px-3 py-2 text-xs text-muted">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold uppercase tracking-[0.16em] text-muted">
            Shared canvas
          </span>
          <Badge tone={wsState === "connected" ? "success" : "warning"}>
            {statusLabel}
          </Badge>
        </div>
      </div>
      <div className="relative min-h-[min(480px,55vh)] flex-1 w-full bg-[#f8f9fa]">
        <Tldraw onMount={onMount} />
      </div>
    </div>
  );
}
