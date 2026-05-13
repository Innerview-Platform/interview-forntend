"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, ListChecks, PenLine, TerminalSquare } from "lucide-react";

export function RoomLeftRail({ roomId }: { roomId: string }) {
  const pathname = usePathname();
  const base = `/room/${encodeURIComponent(roomId)}`;
  const editorHref = `${base}/editor`;
  const canvasHref = `${base}/canvas`;
  const compileHref = `${base}/compile`;
  const submissionsHref = `${base}/submissions`;

  function active(href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const btn = (href: string, current: boolean) =>
    `mx-auto flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
      current
        ? "border-accent/60 bg-accent/15 text-violet-100"
        : "border-transparent text-muted hover:bg-white/5 hover:text-foreground"
    }`;

  return (
    <nav
      className="flex w-14 shrink-0 flex-col gap-1 border-r border-white/10 bg-surface/40 py-4"
      aria-label="Room modes"
    >
      <Link
        href={editorHref}
        title="Live workspace - code beside canvas, splitters, console; video in the right strip (large screens)"
        className={btn(editorHref, active(editorHref))}
      >
        <Layers className="h-5 w-5" aria-hidden />
        <span className="sr-only">Live room</span>
      </Link>
      {/* <Link
        href={canvasHref}
        title="Open live workspace (canvas is on the editor page)"
        className={btn(canvasHref, active(canvasHref))}
      >
        <PenLine className="h-5 w-5" aria-hidden />
        <span className="sr-only">Shared canvas</span>
      </Link> */}
      {/* <Link
        href={compileHref}
        title="Compile output"
        className={btn(compileHref, active(compileHref))}
      >
        <TerminalSquare className="h-5 w-5" aria-hidden />
        <span className="sr-only">Compile output</span>
      </Link> */}
      <Link
        href={submissionsHref}
        title="Submissions"
        className={btn(submissionsHref, active(submissionsHref))}
      >
        <ListChecks className="h-5 w-5" aria-hidden />
        <span className="sr-only">Submissions</span>
      </Link>
    </nav>
  );
}
