"use client";

import type { FeedbackItem } from "@/lib/profile-api";
import { GlassCard } from "@/components/ui/GlassCard";

type Props = {
  items: FeedbackItem[];
  max?: number;
};

export function RecentFeedbackCard({ items, max = 4 }: Props) {
  const slice = items.slice(0, max);

  return (
    <GlassCard className="p-6">
      <h3 className="text-sm font-semibold text-foreground">Recent feedback</h3>
      {slice.length === 0 ? (
        <p className="mt-3 text-xs text-muted">No feedback received yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {slice.map((f, i) => (
            <li
              key={`${f.interview_id}-${i}`}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-amber-200">
                  {f.rating}★
                </span>
                <span className="text-xs text-muted">
                  {f.created_at?.slice(0, 10) ?? ""}
                </span>
              </div>
              <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-white/75">
                {f.comment?.trim() || "No written comment."}
              </p>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
