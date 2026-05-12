"use client";

import { Loader2, Terminal } from "lucide-react";
import type { CompileResultPayload } from "@/lib/compile-result";
import { Badge } from "@/components/ui/Badge";
import { ToolbarButton } from "@/components/ui/ToolbarButton";

type WsState = "off" | "connecting" | "connected";

type Props = {
  wsState: WsState;
  compileResult: CompileResultPayload | null;
  compileBusy: boolean;
  clearCompileResult: () => void;
  className?: string;
};

export function CompileOutputPanel({
  wsState,
  compileResult,
  compileBusy,
  clearCompileResult,
  className,
}: Props) {
  return (
    <div
      className={`flex min-h-[200px] max-h-[min(280px,40vh)] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#080c14] ${className ?? ""}`}
    >
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/10 bg-surface/65 px-3 py-2">
        <Terminal className="h-3.5 w-3.5 text-accent" aria-hidden />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          Run output
        </span>
        {compileBusy ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-teal-200">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            Running…
          </span>
        ) : null}
        {compileResult ? (
          <ToolbarButton
            type="button"
            onClick={() => clearCompileResult()}
            className="ml-auto min-h-7 px-2 py-1"
          >
            Clear
          </ToolbarButton>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 font-mono text-[12px] leading-relaxed">
        {compileResult ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge tone={compileResult.ok ? "success" : "warning"}>
                {compileResult.ok ? "Finished" : "Failed"}
              </Badge>
              <span className="text-muted">
                Piston:{" "}
                <span className="text-foreground">
                  {compileResult.pistonReachable ? "reachable" : "unreachable"}
                </span>
              </span>
              {compileResult.exitCode != null ? (
                <span className="font-mono text-muted">
                  exit {compileResult.exitCode}
                </span>
              ) : null}
            </div>

            {compileResult.errorMessage ? (
              <p className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-2.5 text-amber-100">
                {compileResult.errorMessage}
              </p>
            ) : null}

            {compileResult.stdout ? (
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  stdout
                </p>
                <pre className="whitespace-pre-wrap rounded-lg border border-white/10 bg-black/40 p-3 text-foreground">
                  {compileResult.stdout}
                </pre>
              </div>
            ) : null}

            {compileResult.stderr ? (
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  stderr
                </p>
                <pre className="whitespace-pre-wrap rounded-lg border border-red-500/20 bg-red-950/30 p-3 text-red-100">
                  {compileResult.stderr}
                </pre>
              </div>
            ) : null}

            {compileResult.rawResponsePreview ? (
              <details className="text-xs text-muted">
                <summary className="cursor-pointer select-none text-foreground/80">
                  Raw response preview
                </summary>
                <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded-md bg-black/40 p-2 text-[10px]">
                  {compileResult.rawResponsePreview}
                </pre>
              </details>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-muted">
            {compileBusy
              ? "Waiting for runner…"
              : wsState === "connected"
                ? "Run sends the current editor buffer over STOMP (Piston). Output appears here for everyone in the room."
                : wsState === "connecting"
                  ? "Connecting - run requires a live session."
                  : "Offline - connect to run code."}
          </p>
        )}
      </div>
    </div>
  );
}
