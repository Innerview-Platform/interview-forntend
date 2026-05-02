"use client";

import { useRouter } from "next/navigation";
import { Code2 } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { RemoteCursorState } from "@/hooks/useSharedEditor";
import {
  getClientSessionSnapshot,
  getServerClientSessionSnapshot,
  subscribeClientSession,
} from "@/lib/client-session";
import { siteConfig } from "@/lib/site-config";
import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";

export function EditorRoomView() {
  const router = useRouter();
  const { token, user } = useSyncExternalStore(
    subscribeClientSession,
    getClientSessionSnapshot,
    getServerClientSessionSnapshot,
  );

  const {
    wsState,
    editorState,
    code,
    logs,
    version,
    handleLocalChange,
    compileCode,
    joinError,
    addCursorListener,
    publishSignaling,
  } = useRoomSession();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const cursorFlushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [remoteCursors, setRemoteCursors] = useState<
    Map<string, RemoteCursorState>
  >(() => new Map());

  const displayLabel =
    user?.email?.split("@")[0]?.slice(0, 24) ?? "You";

  const publishCaretFromEl = useCallback(
    (el: HTMLTextAreaElement) => {
      if (wsState !== "connected") return;
      const pos = el.selectionStart ?? 0;
      const before = el.value.slice(0, pos);
      const lines = before.split("\n");
      const line = Math.max(0, lines.length - 1);
      const column = lines[lines.length - 1]?.length ?? 0;
      publishSignaling("CURSOR_UPDATE", {
        line,
        column,
        name: displayLabel,
      });
    },
    [wsState, publishSignaling, displayLabel],
  );

  const scheduleCursorPublish = useCallback(() => {
    if (cursorFlushTimer.current) return;
    cursorFlushTimer.current = setTimeout(() => {
      cursorFlushTimer.current = null;
      const el = textareaRef.current;
      if (el) publishCaretFromEl(el);
    }, 90);
  }, [publishCaretFromEl]);

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
    if (!token || !user?.id) {
      router.replace(siteConfig.routes.login);
    }
  }, [router, token, user?.id]);

  if (!token || !user?.id) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-muted">
        Redirecting to sign in…
      </div>
    );
  }

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
    <div>
      <div className="mb-6 flex flex-wrap items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-violet-500/15 text-accent">
          <Code2 className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Shared editor
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Session:{" "}
            <span className="text-foreground">{statusLabel}</span>
            {" · "}
            WebSocket via{" "}
            <span className="font-mono text-foreground/80">
              NEXT_PUBLIC_WS_ORIGIN
            </span>{" "}
            (fallback{" "}
            <span className="font-mono text-foreground/80">
              http://localhost:8080
            </span>
            ).
          </p>
        </div>
      </div>

      {joinError ? (
        <GlassCard className="mb-6 border-red-500/25 p-4 text-sm text-red-200">
          {joinError}
        </GlassCard>
      ) : null}

      <GlassCard className="overflow-hidden p-0">
        <textarea
          ref={textareaRef}
          className="min-h-[420px] w-full resize-y bg-black/30 p-4 font-mono text-sm leading-relaxed text-foreground outline-none placeholder:text-muted focus:ring-0 sm:min-h-[520px] sm:p-5 sm:text-[13px]"
          spellCheck={false}
          autoComplete="off"
          value={code}
          onChange={(e) => {
            handleLocalChange(e.target.value);
            scheduleCursorPublish();
          }}
          onSelect={scheduleCursorPublish}
          onKeyUp={scheduleCursorPublish}
          onClick={scheduleCursorPublish}
          placeholder={
            editorState === "on"
              ? "Start typing — changes sync via Yjs…"
              : "Waiting for editor sync…"
          }
        />
        {remoteCursors.size > 0 ? (
          <div className="flex flex-wrap gap-2 border-t border-white/10 bg-black/25 px-4 py-2 sm:px-5">
            {Array.from(remoteCursors.values()).map((c) => {
              const hue =
                Array.from(c.userId).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
                360;
              return (
                <span
                  key={c.userId}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2 py-1 font-mono text-[11px]"
                  style={{
                    borderColor: `hsla(${hue}, 70%, 55%, 0.45)`,
                    color: `hsla(${hue}, 85%, 78%, 1)`,
                  }}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: `hsl(${hue}, 70%, 55%)` }}
                    aria-hidden
                  />
                  <span className="truncate">
                    {c.name ?? c.userId.slice(0, 8)}
                    {" · L"}
                    {c.line + 1}:C{c.column + 1}
                  </span>
                </span>
              );
            })}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-black/20 px-4 py-3 text-xs text-muted sm:px-5">
          <span>
            CRDT version bump:{" "}
            <span className="font-mono text-foreground">{version}</span>
          </span>
          <button
            type="button"
            onClick={() => compileCode()}
            disabled={wsState !== "connected"}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 font-medium text-foreground disabled:opacity-40"
          >
            Compile (signal)
          </button>
        </div>
      </GlassCard>

      {logs.length > 0 ? (
        <GlassCard className="mt-6 max-h-48 overflow-y-auto p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Debug log
          </p>
          <ul className="space-y-1 font-mono text-[11px]">
            {logs.slice(-24).map((entry, i) => (
              <li
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
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}
    </div>
  );
}
