"use client";

import { useId } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

export function ProfileCompletenessCard({ percent }: { percent: number }) {
  const gradId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const p = Math.min(100, Math.max(0, Math.round(percent)));
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (p / 100) * circumference;

  return (
    <GlassCard className="p-6">
      <h3 className="text-sm font-semibold text-foreground">Profile strength</h3>
      <p className="mt-1 text-xs text-muted">
        Based on fields filled in on this page.
      </p>
      <div className="mt-6 flex items-center gap-5">
        <div className="relative h-24 w-24 shrink-0">
          <svg className="-rotate-90" width="96" height="96" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="8"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke={`url(#complete-gradient-${gradId})`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
            <defs>
              <linearGradient
                id={`complete-gradient-${gradId}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-foreground">
            {p}%
          </span>
        </div>
        <ul className="min-w-0 flex-1 space-y-1.5 text-xs text-muted">
          <li>Add bio and photo for a stronger first impression.</li>
          <li>List languages you want to practice in.</li>
          <li>Complete more interviews to grow your history.</li>
        </ul>
      </div>
    </GlassCard>
  );
}
