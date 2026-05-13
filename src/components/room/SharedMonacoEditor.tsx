"use client";

import dynamic from "next/dynamic";
import type { editor } from "monaco-editor";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Play } from "lucide-react";
import { MonacoBinding } from "y-monaco";
import {
  PISTON_LANGS,
  type PistonLanguageId,
  pistonLanguageToMonaco,
} from "@/lib/compile-languages";
import {
  getClientSessionSnapshot,
  getServerClientSessionSnapshot,
  subscribeClientSession,
} from "@/lib/client-session";
import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";
import { Badge } from "@/components/ui/Badge";
import { ToolbarButton } from "@/components/ui/ToolbarButton";
import {
  createRemoteCursorContentWidget,
  type RemoteCursorWidgetHandle,
} from "./remote-cursor-content-widgets";

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
    compileBusy,
    compileResult,
    clearCompileResult,
    version,
    getSharedYText,
    logs,
    clearLogs,
    publishSignaling,
    remoteCursors,
  } = useRoomSession();

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const remoteWidgetHandlesRef = useRef(
    new Map<string, RemoteCursorWidgetHandle>(),
  );
  const widgetsBoundEditorRef = useRef<editor.IStandaloneCodeEditor | null>(
    null,
  );
  const cursorWidgetSyncGenRef = useRef(0);
  const [editorEpoch, setEditorEpoch] = useState(0);

  const [pistonLang, setPistonLang] =
    useState<PistonLanguageId>("python");

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
    if (!model) return;
    void import("monaco-editor").then((monaco) => {
      monaco.editor.setModelLanguage(
        model,
        pistonLanguageToMonaco(pistonLang),
      );
    });
  }, [pistonLang, editorEpoch]);

  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    let timer: number | null = null;
    const sub = ed.onDidChangeCursorPosition(() => {
      if (wsState !== "connected") return;
      if (timer != null) return;
      timer = window.setTimeout(() => {
        timer = null;
        const pos = ed.getPosition();
        if (!pos) return;
        const payload: { line: number; column: number; name?: string } = {
          line: pos.lineNumber - 1,
          column: pos.column - 1,
        };
        const label = user?.email?.trim();
        if (label) payload.name = label;
        publishSignaling("CURSOR_UPDATE", payload);
      }, 80);
    });
    return () => {
      sub.dispose();
      if (timer != null) window.clearTimeout(timer);
    };
  }, [editorEpoch, wsState, publishSignaling, user?.email]);

  useEffect(() => {
    const ed = editorRef.current;
    const model = ed?.getModel();
    if (!ed || !model) return;

    const gen = ++cursorWidgetSyncGenRef.current;

    void import("monaco-editor").then((monaco) => {
      if (gen !== cursorWidgetSyncGenRef.current) return;

      const handles = remoteWidgetHandlesRef.current;

      if (widgetsBoundEditorRef.current !== ed) {
        if (widgetsBoundEditorRef.current) {
          const oldEd = widgetsBoundEditorRef.current;
          for (const h of handles.values()) {
            try {
              oldEd.removeContentWidget(h.widget);
            } catch {
              /* editor disposed */
            }
            h.dispose();
          }
          handles.clear();
        }
        widgetsBoundEditorRef.current = ed;
      }

      if (wsState !== "connected") {
        for (const h of handles.values()) {
          try {
            ed.removeContentWidget(h.widget);
          } catch {
            /* noop */
          }
          h.dispose();
        }
        handles.clear();
        widgetsBoundEditorRef.current = null;
        return;
      }

      const keysNow = new Set(Object.keys(remoteCursors));
      for (const key of [...handles.keys()]) {
        if (!keysNow.has(key)) {
          const h = handles.get(key)!;
          try {
            ed.removeContentWidget(h.widget);
          } catch {
            /* noop */
          }
          h.dispose();
          handles.delete(key);
        }
      }

      for (const [key, state] of Object.entries(remoteCursors)) {
        let h = handles.get(key);
        if (!h) {
          h = createRemoteCursorContentWidget(monaco, state, model);
          ed.addContentWidget(h.widget);
          handles.set(key, h);
        } else {
          h.update(state, model);
          ed.layoutContentWidget(h.widget);
        }
      }
    });
  }, [remoteCursors, editorEpoch, wsState]);

  useEffect(
    () => () => {
      cursorWidgetSyncGenRef.current += 1;
      const ed = editorRef.current;
      const handles = remoteWidgetHandlesRef.current;
      if (ed) {
        for (const h of handles.values()) {
          try {
            ed.removeContentWidget(h.widget);
          } catch {
            /* noop */
          }
          h.dispose();
        }
      }
      handles.clear();
      widgetsBoundEditorRef.current = null;
    },
    [],
  );

  const onMount = useCallback((ed: editor.IStandaloneCodeEditor) => {
    editorRef.current = ed;
    setEditorEpoch((n) => n + 1);
  }, []);

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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#080c14]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-surface/65 px-3 py-2 text-xs text-muted">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold uppercase tracking-[0.16em] text-muted">
            Live code
          </span>
          <Badge tone={wsState === "connected" ? "success" : "warning"}>
            {statusLabel}
          </Badge>
          <span className="font-mono text-muted">v{version}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5">
            <span className="sr-only">Language</span>
            <select
              className="max-w-[150px] rounded-lg border border-white/15 bg-surface-soft/80 px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/25"
              value={pistonLang}
              onChange={(e) =>
                setPistonLang(e.target.value as PistonLanguageId)
              }
            >
              {PISTON_LANGS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <ToolbarButton
            type="button"
            onClick={() => {
              const sel =
                PISTON_LANGS.find((x) => x.id === pistonLang) ??
                PISTON_LANGS[0];
              compileCode({ language: sel.id, version: sel.version });
            }}
            disabled={wsState !== "connected" || compileBusy}
            tone="success"
          >
            <Play className="h-3.5 w-3.5" aria-hidden />
            {compileBusy ? "Running…" : "Run"}
          </ToolbarButton>
          {compileResult ? (
            <ToolbarButton
              type="button"
              onClick={() => clearCompileResult()}
            >
              Clear output
            </ToolbarButton>
          ) : null}
        </div>
      </div>
      {joinError ? (
        <p className="border-b border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {joinError}
        </p>
      ) : null}
      <div className="min-h-[min(480px,55vh)] flex-1 bg-[#090d16]">
        <MonacoEditor
          height="100%"
          theme="vs-dark"
          defaultLanguage="python"
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
        <details className="border-t border-white/10 bg-surface/60 text-xs">
          <summary className="cursor-pointer px-3 py-2 text-muted hover:text-foreground">
            Developer log ({logs.length})
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
