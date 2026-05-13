"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  apiListProblems,
  type ProblemResponseDto,
} from "@/lib/problems-api";
import { siteConfig } from "@/lib/site-config";

export default function ProblemsExplorePage() {
  const [items, setItems] = useState<ProblemResponseDto[]>([]);
  const [search, setSearch] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const page = await apiListProblems({
          page: 0,
          size: 20,
          search: search.trim() || undefined,
        });
        if (!cancelled) setItems(page.content);
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Failed to load");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [search]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Explore problems</h1>
          <p className="mt-1 text-sm text-muted">
            Public list from <code className="text-xs">GET /api/problems</code>.{" "}
            <Link href={`${siteConfig.routes.problems}/mine`} className="text-accent hover:underline">
              My problems
            </Link>
            {" · "}
            <Link href={`${siteConfig.routes.problems}/new`} className="text-accent hover:underline">
              New
            </Link>
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title…"
          className="min-w-[12rem] rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2 text-sm outline-none focus:border-accent/50"
        />
      </div>
      {err ? (
        <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-rose-100">{err}</p>
      ) : null}
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.id}>
            <Link
              href={`${siteConfig.routes.problems}/${encodeURIComponent(p.slug)}`}
              className="block rounded-xl border border-white/10 bg-black/25 px-4 py-3 transition hover:border-accent/40"
            >
              <span className="font-medium text-foreground">{p.title}</span>
              <span className="ml-2 text-xs text-muted">{p.difficulty}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
