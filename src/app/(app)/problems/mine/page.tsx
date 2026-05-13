"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  apiListMyProblems,
  type ProblemOwnerDto,
} from "@/lib/problems-api";
import { siteConfig } from "@/lib/site-config";

export default function ProblemsMinePage() {
  const [active, setActive] = useState(true);
  const [items, setItems] = useState<ProblemOwnerDto[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const page = await apiListMyProblems({
          page: 0,
          size: 30,
          isActive: active,
        });
        if (!cancelled) setItems(page.content);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">My problems</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActive(true)}
            className={`rounded-lg px-3 py-1.5 text-sm ${active ? "bg-accent/20 text-foreground" : "text-muted"}`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setActive(false)}
            className={`rounded-lg px-3 py-1.5 text-sm ${!active ? "bg-accent/20 text-foreground" : "text-muted"}`}
          >
            Inactive
          </button>
        </div>
      </div>
      <p className="mb-4 text-sm text-muted">
        <Link href={siteConfig.routes.problems} className="text-accent hover:underline">
          Explore
        </Link>
        {" · "}
        <Link href={`${siteConfig.routes.problems}/new`} className="text-accent hover:underline">
          New problem
        </Link>
      </p>
      {err ? <p className="mb-4 text-sm text-rose-200">{err}</p> : null}
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/25 px-4 py-3">
            <Link
              href={`${siteConfig.routes.problems}/${encodeURIComponent(p.slug)}`}
              className="font-medium text-foreground hover:underline"
            >
              {p.title}
            </Link>
            <Link
              href={`${siteConfig.routes.problems}/${encodeURIComponent(p.slug)}/edit`}
              className="text-xs text-accent hover:underline"
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
