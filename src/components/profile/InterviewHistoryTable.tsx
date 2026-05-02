"use client";

import type { InterviewHistoryItem, PreferredRole } from "@/lib/profile-api";
import { GlassCard } from "@/components/ui/GlassCard";

const roleLabels: Record<PreferredRole, string> = {
  INTERVIEWER: "Interviewer",
  INTERVIEWEE: "Interviewee",
  BOTH: "Both",
};

function labelRole(v: string): string {
  return roleLabels[v as PreferredRole] ?? v;
}

type Props = {
  rows: InterviewHistoryItem[];
};

function formatTitle(row: InterviewHistoryItem): string {
  const type = row.type?.trim() || "Interview";
  return `${type} · #${row.interview_id}`;
}

export function InterviewHistoryTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <GlassCard className="p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-foreground">Interview history</h2>
        <p className="mt-2 text-sm text-muted">No interviews yet.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden p-0 sm:p-0">
      <div className="border-b border-white/10 px-6 py-5 sm:px-8">
        <h2 className="text-lg font-semibold text-foreground">Interview history</h2>
        <p className="mt-1 text-sm text-muted">
          Past sessions synced from your account.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wide text-muted">
              <th className="px-6 py-3 font-medium sm:px-8">Session</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Your role</th>
              <th className="px-6 py-3 font-medium sm:pr-8">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.interview_id}
                className="border-b border-white/5 transition hover:bg-white/[0.03]"
              >
                <td className="px-6 py-4 font-medium text-foreground sm:px-8">
                  <div className="flex flex-col gap-0.5">
                    <span>{formatTitle(row)}</span>
                    <span className="text-xs font-normal text-muted">{row.type}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-muted">
                  {row.start_time ?? "—"}
                </td>
                <td className="px-4 py-4 text-muted">
                  {row.duration_minutes != null ? `${row.duration_minutes} min` : "—"}
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-foreground">
                    {labelRole(row.role)}
                  </span>
                </td>
                <td className="px-6 py-4 sm:pr-8">
                  <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-200">
                    Completed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
