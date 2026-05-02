"use client";

type Stat = {
  label: string;
  value: string;
  hint?: string;
};

export function StatCardsRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {s.label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{s.value}</p>
          {s.hint ? (
            <p className="mt-1 text-xs text-muted">{s.hint}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
