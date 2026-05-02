"use client";

import dynamic from "next/dynamic";
import type { editor } from "monaco-editor";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { MonacoBinding } from "y-monaco";
import type { RemoteCursorState } from "@/hooks/useSharedEditor";
import {
  getClientSessionSnapshot,
  getServerClientSessionSnapshot,
  subscribeClientSession,
} from "@/lib/client-session";
import { getUserHue } from "@/lib/user-color";
import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";

const MonacoEditor = dynamic(
  async () => (await import("@monaco-editor/react")).default,
  { ssr: false },
);

export function SharedMonacoEditor() {
  const { token, user } = useSyncExternalStore(
    subscribeClientSession,
    getClientSessionSnapshot,
    getServerClientSessionSnapshot,
  );

  const {
    wsState,
    editorState,
    joinError,
    compileCode,
    version,
    addCursorListener,
    publishSignaling,
    getSharedYText,
    logs,
    clearLogs,
  } = useRoomSession();

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const cursorFlushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const decorationIdsRef = useRef<string[]>([]);
  const [editorEpoch, setEditorEpoch] = useState(0);

  const [remoteCursors, setRemoteCursors] = useState<
    Map<string, RemoteCursorState>
  >(() => new Map());

  const displayLabel =
    user?.email?.split("@")[0]?.slice(0, 24) ?? "You";

  const scheduleCursorPublish = useCallback(
    (ed: editor.IStandaloneCodeEditor) => {
      if (cursorFlushTimer.current) return;
      cursorFlushTimer.current = setTimeout(() => {
        cursorFlushTimer.current = null;
        if (wsState !== "connected") return;
        const pos = ed.getPosition();
        if (!pos) return;
        publishSignaling("CURSOR_UPDATE", {
          line: pos.lineNumber - 1,
          column: pos.column - 1,
          name: displayLabel,
        });
      }, 90);
    },
    [wsState, publishSignaling, displayLabel],
  );

  useEffect(
    () => () => {
      if (cursorFlushTimer.current) clearTimeout(cursorFlushTimer.current);
    },
    [],
  );

  useEffect(() => {
    const uid = user?.id;
    return addCursorListener((msg) => {
      if (!msg.userId || !uid || msg.userId === uid) return;
      setRemoteCursors((prev) => {
        const next = new Map(prev);
        next.set(msg.userId, msg);
        return next;
      });
    });
  }, [addCursorListener, user?.id]);

  useEffect(() => {
    const ed = editorRef.current;
    const ytext = getSharedYText();
    if (!ed || !ytext) return;
    const model = ed.getModel();
    if (!model) return;
    bindingRef.current?.destroy();
    bindingRef.current = new MonacoBinding(ytext, model, new Set([ed]));
    return () => {
      bindingRef.current?.destroy();
      bindingRef.current = null;
    };
  }, [getSharedYText, wsState, editorState, editorEpoch]);

  useEffect(() => {
    const ed = editorRef.current;
    const model = ed?.getModel();
    if (!ed || !model) return;

    let cancelled = false;
    void import("monaco-editor").then((monaco) => {
      if (cancelled) return;
      const decos: editor.IModelDeltaDecoration[] = [];
      remoteCursors.forEach((c, userId) => {
        const line = c.line + 1;
        const maxCol = Math.max(1, model.getLineMaxColumn(line));
        const hue = getUserHue(userId);
        decos.push({
          range: new monaco.Range(line, 1, line, maxCol),
          options: {
            isWholeLine: true,
            overviewRuler: {
              color: `hsla(${hue}, 65%, 55%, 0.65)`,
              position: monaco.editor.OverviewRulerLane.Full,
            },
          },
        });
      });
      decorationIdsRef.current = ed.deltaDecorations(
        decorationIdsRef.current,
        decos,
      );
    });

    return () => {
      cancelled = true;
    };
  }, [remoteCursors]);

  const onMount = useCallback(
    (ed: editor.IStandaloneCodeEditor) => {
      editorRef.current = ed;
      setEditorEpoch((n) => n + 1);
      ed.onDidChangeCursorPosition(() => scheduleCursorPublish(ed));
      ed.onDidFocusEditorText(() => scheduleCursorPublish(ed));
    },
    [scheduleCursorPublish],
  );

  if (!token || !user?.id) return null;

  const statusLabel =
    wsState === "connected"
      ? editorState === "on"
        ? "Live"
        : editorState === "joining"
          ? "Syncing…"
          : "Connected"
      : wsState === "connecting"
        ? "Connecting…"
        : "Offline";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2 text-xs text-muted">
        <span>
          Live code ·{" "}
          <span className="text-foreground">{statusLabel}</span>
          {" · "}v{" "}
          <span className="font-mono text-foreground">{version}</span>
        </span>
        <button
          type="button"
          onClick={() => compileCode()}
          disabled={wsState !== "connected"}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-foreground disabled:opacity-40"
        >
          Compile
        </button>
      </div>
      {joinError ? (
        <p className="border-b border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {joinError}
        </p>
      ) : null}
      <div className="min-h-[min(480px,55vh)] flex-1">
        <MonacoEditor
          height="100%"
          theme="vs-dark"
          defaultLanguage="typescript"
          onMount={onMount}
          options={{
            minimap: { enabled: false },
            wordWrap: "on",
            fontSize: 13,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
          loading={
            <div className="flex h-64 items-center justify-center text-sm text-muted">
              Loading editor…
            </div>
          }
        />
      </div>
      {logs.length > 0 ? (
        <details className="border-t border-white/10 bg-black/30 text-xs">
          <summary className="cursor-pointer px-3 py-2 text-muted hover:text-foreground">
            Debug log ({logs.length}) — click to expand
          </summary>
          <div className="max-h-32 overflow-y-auto border-t border-white/10 px-3 py-2 font-mono">
            {logs.slice(-20).map((entry, i) => (
              <div
                key={`${entry.msg}-${i}`}
                className={
                  entry.type === "err"
                    ? "text-red-300"
                    : entry.type === "warn"
                      ? "text-amber-200"
                      : entry.type === "ok"
                        ? "text-emerald-200"
                        : "text-muted"
                }
              >
                {entry.msg}
              </div>
            ))}
            <button
              type="button"
              onClick={() => clearLogs()}
              className="mt-2 text-[10px] text-muted underline"
            >
              Clear
            </button>
          </div>
        </details>
      ) : null}
    </div>
  );
}
