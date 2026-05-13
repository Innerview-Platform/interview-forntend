"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  DoorOpen,
  LayoutDashboard,
  MonitorPlay,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  getClientSessionSnapshot,
  getServerClientSessionSnapshot,
  subscribeClientSession,
} from "@/lib/client-session";
import { siteConfig } from "@/lib/site-config";
import {
  apiCreateInstantInterview,
  apiCreateScheduledInterview,
  CREATOR_ROLES,
  INTERVIEW_TYPES,
  ROOM_SIZES,
  type InterviewType,
  type CreatorInterviewRole,
  type RoomSize,
} from "@/lib/interview-api";

function parseUuidList(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function localDateTimeToIso(local: string): string {
  if (!local) return "";
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

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
  const [roomSize, setRoomSize] = useState<RoomSize>("ONE_ON_ONE");
  const [problemIdsInput, setProblemIdsInput] = useState("");
  const [scheduleStartLocal, setScheduleStartLocal] = useState("");
  const [schedulePending, setSchedulePending] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
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
      const ids = parseUuidList(problemIdsInput);
      const res = await apiCreateInstantInterview({
        interviewType,
        roomSize,
        creatorInterviewRole: creatorRole,
        problemIds: ids.length ? ids : undefined,
      });
      router.push(`/room/${encodeURIComponent(res.roomId)}/editor`);
    } catch (e) {
      setStartError(e instanceof Error ? e.message : "Could not start interview");
    } finally {
      setStartPending(false);
    }
  }

  async function handleScheduleInterview() {
    setScheduleError(null);
    const iso = localDateTimeToIso(scheduleStartLocal);
    if (!iso) {
      setScheduleError("Pick a valid start date and time.");
      return;
    }
    setSchedulePending(true);
    try {
      const ids = parseUuidList(problemIdsInput);
      const res = await apiCreateScheduledInterview({
        interviewType,
        roomSize,
        creatorInterviewRole: creatorRole,
        startTime: iso,
        problemIds: ids.length ? ids : undefined,
      });
      router.push(`/room/${encodeURIComponent(res.roomId)}/editor`);
    } catch (e) {
      setScheduleError(
        e instanceof Error ? e.message : "Could not schedule interview",
      );
    } finally {
      setSchedulePending(false);
    }
  }

  function handleJoinRoom() {
    const code = joinCode.trim();
    if (!code) return;
    router.push(`/room/${encodeURIComponent(code)}/editor`);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-5 sm:py-10">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-accent">
          <LayoutDashboard className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Overview
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Start a live mock interview, join an existing room, or tune your
            profile so partners know what to practice with you.
          </p>
        </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="success">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Signed in
          </Badge>
          <Badge tone="neutral">{user.email}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <GlassCard className="p-6 sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-success/25 bg-success/10 text-success">
            <MonitorPlay className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Live interview room
            </h2>
            <p className="mt-1 text-sm text-muted">
              Create a backend interview or jump into a room code from a host.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Start instant interview
            </p>
            <div className="grid gap-4 md:grid-cols-2 md:items-end">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-muted-strong">Interview type</span>
                <select
                  className="w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/25"
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
                <span className="mb-1.5 block font-medium text-muted-strong">Your role</span>
                <select
                  className="w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/25"
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
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-muted-strong">Room size</span>
                <select
                  className="w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/25"
                  value={roomSize}
                  onChange={(e) =>
                    setRoomSize(e.target.value as RoomSize)
                  }
                >
                  {ROOM_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s === "ONE_ON_ONE" ? "One on one" : "Group (many)"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm md:col-span-2">
                <span className="mb-1.5 block font-medium text-muted-strong">
                  Problem IDs (optional)
                </span>
                <textarea
                  value={problemIdsInput}
                  onChange={(e) => setProblemIdsInput(e.target.value)}
                  rows={2}
                  placeholder="UUIDs separated by comma or space (active problems only)"
                  className="w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2.5 font-mono text-xs text-foreground outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/25"
                />
              </label>
              <div className="flex flex-col gap-2 md:col-span-2 md:flex-row md:items-center md:justify-end">
                <button
                  type="button"
                  onClick={() => void handleStartInstant()}
                  disabled={startPending}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-success/30 bg-success/90 px-5 py-2.5 text-sm font-semibold text-[#04130d] shadow transition hover:bg-success disabled:opacity-50"
                >
                  {startPending ? "Starting…" : "Start & open room"}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
            {startError ? (
              <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-rose-100">{startError}</p>
            ) : null}
          </div>

          <div className="border-t border-white/10 pt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Schedule interview
            </p>
            <p className="mb-3 text-xs text-muted">
              Uses the same payload as instant, plus a start time in your local timezone. Share the room link after scheduling.
            </p>
            <label className="mb-3 block text-sm">
              <span className="mb-1.5 block font-medium text-muted-strong">Start time</span>
              <input
                type="datetime-local"
                value={scheduleStartLocal}
                onChange={(e) => setScheduleStartLocal(e.target.value)}
                className="w-full max-w-md rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/25"
              />
            </label>
            <button
              type="button"
              onClick={() => void handleScheduleInterview()}
              disabled={schedulePending}
              className="rounded-lg border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/[0.1] disabled:opacity-50"
            >
              {schedulePending ? "Scheduling…" : "Schedule & open room"}
            </button>
            {scheduleError ? (
              <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-rose-100">{scheduleError}</p>
            ) : null}
          </div>

          <div className="border-t border-white/10 pt-8">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
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
                className="min-w-0 flex-1 rounded-lg border border-white/15 bg-surface-soft/80 px-4 py-2.5 font-mono text-sm text-foreground outline-none placeholder:text-muted focus:border-accent/50 focus:ring-2 focus:ring-accent/25"
              />
              <button
                type="button"
                onClick={handleJoinRoom}
                disabled={!joinCode.trim()}
                className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/5 disabled:opacity-40"
              >
                Join room
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-6">
        <GlassCard className="p-6">
          <SectionHeader
            eyebrow="Profile readiness"
            title="Make partners trust the session"
            description="Your profile and language tags help interview partners understand your level and goals before the call starts."
          />
          <Link
            href={siteConfig.routes.profile}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/[0.08]"
          >
            <UserRound className="h-4 w-4" aria-hidden />
            Open profile
          </Link>
        </GlassCard>
        <GlassCard className="p-6">
          <SectionHeader
            eyebrow="Account"
            title="Session identity"
            description="Used by protected API calls, room joins, and realtime session labels."
          />
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="mt-1 font-medium text-foreground">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted">User ID</dt>
              <dd className="mt-1 break-all font-mono text-xs text-muted-strong">
                {user.id}
              </dd>
            </div>
          </dl>
        </GlassCard>
      </div>
      </div>

      <div className="mt-6">
        <EmptyState
          title="Recent activity will appear here"
          description="Interview history JSON from GET /api/interviews/user/{id}/history is not wired in the UI yet; use your profile tabs for interview and feedback lists."
        />
      </div>
    </div>
  );
}
