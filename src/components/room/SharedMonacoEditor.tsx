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
import { Play } from "lucide-react";
import { MonacoBinding } from "y-monaco";
import type { RemoteCursorState } from "@/hooks/useSharedEditor";
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
import {
  createRemoteCursorContentWidget,
  type RemoteCursorWidgetHandle,
} from "@/components/room/remote-cursor-content-widgets";
import { canonicalUserKey, sameUserIdentity } from "@/lib/user-id";

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
    addCursorListener,
    publishSignaling,
    getSharedYText,
    logs,
    clearLogs,
  } = useRoomSession();

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const cursorFlushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remoteCursorWidgetsRef = useRef<
    Map<string, RemoteCursorWidgetHandle>
  >(new Map());
  const [editorEpoch, setEditorEpoch] = useState(0);

  const [remoteCursors, setRemoteCursors] = useState<
    Map<string, RemoteCursorState>
  >(() => new Map());

  const [pistonLang, setPistonLang] =
    useState<PistonLanguageId>("python");

  const displayLabel =
    user?.email?.split("@")[0]?.slice(0, 24) ?? "You";

  /** Send caret now (publishSignaling no-ops until STOMP is connected). */
  const publishCursorFromEditor = useCallback(
    (ed: editor.IStandaloneCodeEditor) => {
      const pos = ed.getPosition();
      if (!pos) return;
      publishSignaling("CURSOR_UPDATE", {
        line: pos.lineNumber - 1,
        column: pos.column - 1,
        name: displayLabel,
      });
    },
    [publishSignaling, displayLabel],
  );

  /** Trailing debounce — always reset timer so bursts don’t starve updates. */
  const scheduleCursorPublish = useCallback(
    (ed: editor.IStandaloneCodeEditor) => {
      if (cursorFlushTimer.current) clearTimeout(cursorFlushTimer.current);
      cursorFlushTimer.current = setTimeout(() => {
        cursorFlushTimer.current = null;
        publishCursorFromEditor(ed);
      }, 90);
    },
    [publishCursorFromEditor],
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
      if (!msg.userId || !uid) return;
      if (sameUserIdentity(msg.userId, uid)) return;
      setRemoteCursors((prev) => {
        const next = new Map(prev);
        const key = canonicalUserKey(msg.userId);
        next.set(key, { ...msg, userId: msg.userId });
        return next;
      });
    });
  }, [addCursorListener, user?.id]);

  /** Immediate caret broadcast when connected/editor ready (avoid debounce starvation + stale wsState). */
  useEffect(() => {
    if (wsState !== "connected") return;
    const ed = editorRef.current;
    if (!ed) return;
    publishCursorFromEditor(ed);
    scheduleCursorPublish(ed);
  }, [wsState, editorEpoch, publishCursorFromEditor, scheduleCursorPublish]);

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
    const model = ed?.getModel();
    if (!ed || !model) return;

    let cancelled = false;
    void import("monaco-editor").then((monaco) => {
      if (cancelled) return;

      const keep = new Set(remoteCursors.keys());
      remoteCursorWidgetsRef.current.forEach((handle, userId) => {
        if (!keep.has(userId)) {
          handle.dispose();
          ed.removeContentWidget(handle.widget);
          remoteCursorWidgetsRef.current.delete(userId);
        }
      });

      remoteCursors.forEach((state, userId) => {
        let handle = remoteCursorWidgetsRef.current.get(userId);
        if (!handle) {
          handle = createRemoteCursorContentWidget(monaco, state, model);
          ed.addContentWidget(handle.widget);
          remoteCursorWidgetsRef.current.set(userId, handle);
        } else {
          handle.update(state, model);
          ed.layoutContentWidget(handle.widget);
        }
      });
      requestAnimationFrame(() => {
        if (cancelled) return;
        remoteCursorWidgetsRef.current.forEach((h) =>
          ed.layoutContentWidget(h.widget),
        );
      });
    });

    return () => {
      cancelled = true;
    };
  }, [remoteCursors]);

  /** After CRDT merges, reschedule caret so anchors stay consistent with the model. */
  useEffect(() => {
    const ed = editorRef.current;
    if (!ed || wsState !== "connected") return;
    scheduleCursorPublish(ed);
  }, [version, wsState, scheduleCursorPublish]);

  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    const scrollSub = ed.onDidScrollChange(() => {
      remoteCursorWidgetsRef.current.forEach((h) =>
        ed.layoutContentWidget(h.widget),
      );
    });
    const layoutSub = ed.onDidLayoutChange(() => {
      remoteCursorWidgetsRef.current.forEach((h) =>
        ed.layoutContentWidget(h.widget),
      );
    });
    return () => {
      scrollSub.dispose();
      layoutSub.dispose();
    };
  }, [editorEpoch]);

  useEffect(
    () => () => {
      const ed = editorRef.current;
      remoteCursorWidgetsRef.current.forEach((handle) => {
        handle.dispose();
        try {
          ed?.removeContentWidget(handle.widget);
        } catch {
          /* editor may be disposed */
        }
      });
      remoteCursorWidgetsRef.current.clear();
    },
    [],
  );

  const onMount = useCallback(
    (ed: editor.IStandaloneCodeEditor) => {
      editorRef.current = ed;
      setEditorEpoch((n) => n + 1);
      ed.onDidChangeCursorPosition(() => scheduleCursorPublish(ed));
      ed.onDidChangeCursorSelection(() => scheduleCursorPublish(ed));
      ed.onDidFocusEditorText(() => scheduleCursorPublish(ed));
      ed.onDidChangeModelContent(() => scheduleCursorPublish(ed));
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
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5">
            <span className="sr-only">Language</span>
            <select
              className="max-w-[140px] rounded-lg border border-white/15 bg-black/30 px-2 py-1 text-xs text-foreground"
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
          <button
            type="button"
            onClick={() => {
              const sel =
                PISTON_LANGS.find((x) => x.id === pistonLang) ??
                PISTON_LANGS[0];
              compileCode({ language: sel.id, version: sel.version });
            }}
            disabled={wsState !== "connected" || compileBusy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-100 disabled:opacity-40"
          >
            <Play className="h-3.5 w-3.5" aria-hidden />
            {compileBusy ? "Running…" : "Run"}
          </button>
          {compileResult ? (
            <button
              type="button"
              onClick={() => clearCompileResult()}
              className="text-xs text-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              Clear output
            </button>
          ) : null}
        </div>
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
