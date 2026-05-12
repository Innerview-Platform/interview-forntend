"use client";

import { StatTile } from "@/components/ui/StatTile";

type Stat = {
  label: string;
  value: string;
  hint?: string;
};

export function StatCardsRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <StatTile key={s.label} {...s} />
      ))}
    </div>
  );
}
