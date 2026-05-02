"use client";

import { useRouter } from "next/navigation";
import { Play, Terminal } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  getClientSessionSnapshot,
  getServerClientSessionSnapshot,
  subscribeClientSession,
} from "@/lib/client-session";
import { siteConfig } from "@/lib/site-config";

const LANGS = [
  { id: "python", label: "Python", version: "*" },
  { id: "javascript", label: "JavaScript", version: "*" },
] as const;

export function CompileRoomView() {
  const router = useRouter();
  const { token, user } = useSyncExternalStore(
    subscribeClientSession,
    getClientSessionSnapshot,
    getServerClientSessionSnapshot,
  );

  const {
    wsState,
    code,
    compileCode,
    compileResult,
    compileBusy,
    joinError,
    clearCompileResult,
  } = useRoomSession();

  const [language, setLanguage] =
    useState<(typeof LANGS)[number]["id"]>("python");

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

  const selected = LANGS.find((l) => l.id === language) ?? LANGS[0];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-emerald-500/15 text-emerald-300">
          <Terminal className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Compile / test
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Runs code via{" "}
            <span className="font-mono text-foreground/90">Piston</span>{" "}
            (Spring calls{" "}
            <span className="font-mono text-foreground/90">
              POST /api/v2/execute
            </span>
            ). Start Piston locally on port{" "}
            <span className="font-mono">2000</span>; configure Spring with{" "}
            <span className="font-mono text-foreground/90">PISTON_BASE_URL</span>{" "}
            if needed.
          </p>
        </div>
      </div>

      {joinError ? (
        <GlassCard className="mb-6 border-red-500/25 p-4 text-sm text-red-200">
          {joinError}
        </GlassCard>
      ) : null}

      <GlassCard className="mb-6 space-y-4 p-5">
        <div className="flex flex-wrap items-end gap-4">
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Language</span>
            <select
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-foreground"
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value as (typeof LANGS)[number]["id"])
              }
            >
              {LANGS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() =>
              compileCode({
                language: selected.id,
                version: selected.version,
              })
            }
            disabled={wsState !== "connected" || compileBusy}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-100 disabled:opacity-40"
          >
            <Play className="h-4 w-4" />
            {compileBusy ? "Running…" : "Run on Piston"}
          </button>
          {compileResult ? (
            <button
              type="button"
              onClick={() => clearCompileResult()}
              className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              Clear result
            </button>
          ) : null}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted">
            Code snapshot (synced from Editor tab)
          </p>
          <pre className="max-h-56 overflow-auto rounded-xl border border-white/10 bg-black/35 p-4 font-mono text-[12px] leading-relaxed text-foreground/90">
            {code || "(empty — type in the Editor tab)"}
          </pre>
        </div>
      </GlassCard>

      {compileResult ? (
        <GlassCard className="space-y-3 p-5">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span
              className={
                compileResult.ok
                  ? "font-semibold text-emerald-300"
                  : "font-semibold text-amber-200"
              }
            >
              {compileResult.ok ? "Finished" : "Failed"}
            </span>
            <span className="text-muted">
              Piston reachable:{" "}
              <span className="text-foreground">
                {compileResult.pistonReachable ? "yes" : "no"}
              </span>
            </span>
            {compileResult.exitCode != null ? (
              <span className="font-mono text-muted">
                exit {compileResult.exitCode}
              </span>
            ) : null}
          </div>

          {compileResult.errorMessage ? (
            <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-100">
              {compileResult.errorMessage}
            </p>
          ) : null}

          {compileResult.stdout ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
                stdout
              </p>
              <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/35 p-4 font-mono text-[12px] text-foreground">
                {compileResult.stdout}
              </pre>
            </div>
          ) : null}

          {compileResult.stderr ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
                stderr
              </p>
              <pre className="whitespace-pre-wrap rounded-xl border border-red-500/20 bg-red-950/30 p-4 font-mono text-[12px] text-red-100">
                {compileResult.stderr}
              </pre>
            </div>
          ) : null}

          {compileResult.rawResponsePreview ? (
            <details className="text-sm text-muted">
              <summary className="cursor-pointer select-none text-foreground/80">
                Raw response preview
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-black/40 p-3 font-mono text-[10px]">
                {compileResult.rawResponsePreview}
              </pre>
            </details>
          ) : null}
        </GlassCard>
      ) : (
        <p className="text-sm text-muted">
          WS:{" "}
          <span className="text-foreground">
            {wsState === "connected"
              ? "connected"
              : wsState === "connecting"
                ? "connecting…"
                : "offline"}
          </span>
          . Results appear here for everyone in the room via STOMP.
        </p>
      )}
    </div>
  );
}
