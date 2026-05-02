"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, MonitorPlay, DoorOpen } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  getClientSessionSnapshot,
  getServerClientSessionSnapshot,
  subscribeClientSession,
} from "@/lib/client-session";
import { siteConfig } from "@/lib/site-config";
import {
  apiCreateInstantInterview,
  CREATOR_ROLES,
  INTERVIEW_TYPES,
  type InterviewType,
  type CreatorInterviewRole,
} from "@/lib/interview-api";

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim();
  if (!local) return "there";
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DashboardView() {
  const router = useRouter();
  const [interviewType, setInterviewType] = useState<InterviewType>("TECHNICAL");
  const [creatorRole, setCreatorRole] =
    useState<CreatorInterviewRole>("INTERVIEWER");
  const [startPending, setStartPending] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");

  const { token, user } = useSyncExternalStore(
    subscribeClientSession,
    getClientSessionSnapshot,
    getServerClientSessionSnapshot,
  );

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

  const firstName = user.email ? displayNameFromEmail(user.email) : "there";

  async function handleStartInstant() {
    setStartError(null);
    setStartPending(true);
    try {
      const res = await apiCreateInstantInterview({
        interviewType,
        creatorInterviewRole: creatorRole,
        durationMinutes: 60,
      });
      router.push(`/room/${encodeURIComponent(res.roomId)}/editor`);
    } catch (e) {
      setStartError(e instanceof Error ? e.message : "Could not start interview");
    } finally {
      setStartPending(false);
    }
  }

  function handleJoinRoom() {
    const code = joinCode.trim();
    if (!code) return;
    router.push(`/room/${encodeURIComponent(code)}/editor`);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-5">
      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-violet-500/15 text-accent">
          <LayoutDashboard className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Overview
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            You&apos;re in the app shell. Open your profile to update your hero card,
            languages, and interview history, or head home to read the marketing
            site.
          </p>
        </div>
      </div>

      <GlassCard className="p-8 sm:p-10">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="mt-1 font-medium text-foreground">{user.email}</dd>
          </div>
          <div>
            <dt className="text-muted">User ID</dt>
            <dd className="mt-1 break-all font-mono text-foreground/90">
              {user.id}
            </dd>
          </div>
        </dl>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href={siteConfig.routes.profile}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-accent-violet to-accent-strong px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-[0_0_24px_rgba(192,132,252,0.45)]"
          >
            Go to profile
          </Link>
          <Link
            href={siteConfig.routes.home}
            className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-transparent px-5 py-3 text-sm font-medium text-foreground transition hover:border-accent/50 hover:bg-white/5"
          >
            Marketing home
          </Link>
        </div>
      </GlassCard>

      <GlassCard className="mt-8 p-8 sm:p-10">
        <div className="mb-6 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-emerald-500/15 text-emerald-300">
            <MonitorPlay className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Live interview room
            </h2>
            <p className="mt-1 text-sm text-muted">
              Start creates an interview in the backend and opens the shared editor.
              Join navigates to an existing room code.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Start instant interview
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
              <label className="block text-sm">
                <span className="mb-1 block text-muted">Type</span>
                <select
                  className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-foreground"
                  value={interviewType}
                  onChange={(e) =>
                    setInterviewType(e.target.value as InterviewType)
                  }
                >
                  {INTERVIEW_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-muted">Your role</span>
                <select
                  className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-foreground"
                  value={creatorRole}
                  onChange={(e) =>
                    setCreatorRole(e.target.value as CreatorInterviewRole)
                  }
                >
                  {CREATOR_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => void handleStartInstant()}
                disabled={startPending}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600/90 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {startPending ? "Starting…" : "Start & open room"}
              </button>
            </div>
            {startError ? (
              <p className="mt-3 text-sm text-red-300">{startError}</p>
            ) : null}
          </div>

          <div className="border-t border-white/10 pt-8">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <DoorOpen className="h-3.5 w-3.5" aria-hidden />
              Join with room code
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                placeholder="Paste room id from host"
                className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted"
              />
              <button
                type="button"
                onClick={handleJoinRoom}
                disabled={!joinCode.trim()}
                className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/5 disabled:opacity-40"
              >
                Join room
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
