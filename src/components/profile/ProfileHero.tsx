"use client";

import { Share2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export type ProfileHeroProps = {
  displayName: string;
  handle: string;
  bio: string | null;
  experienceLabel: string;
  roleLabel: string;
  imageSrc: string | null;
  initials: string;
  profileExists: boolean;
  completenessPercent: number;
  preferredRolePill: string;
  onEditProfile: () => void;
  onShare: () => void;
};

export function ProfileHero({
  displayName,
  handle,
  bio,
  experienceLabel,
  roleLabel,
  imageSrc,
  initials,
  profileExists,
  completenessPercent,
  preferredRolePill,
  onEditProfile,
  onShare,
}: ProfileHeroProps) {
  const levelLabel = Math.min(99, Math.max(1, Math.round(completenessPercent / 12)));

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(17,24,39,0.96),rgba(8,13,24,0.98)_55%,rgba(30,41,59,0.82))]"
        aria-hidden
      />
      <div className="relative px-6 pb-8 pt-8 sm:px-10 sm:pb-10 sm:pt-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="flex shrink-0 flex-col items-center gap-4 sm:flex-row sm:items-start lg:flex-col lg:items-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-accent/25 blur-md" />
              {imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageSrc}
                  alt=""
                  className="relative h-28 w-28 rounded-full object-cover shadow-xl ring-2 ring-white/15 sm:h-32 sm:w-32"
                />
              ) : (
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-accent text-xl font-bold text-white shadow-xl ring-2 ring-white/15 sm:h-32 sm:w-32">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left lg:items-center lg:text-center">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-black/25 px-3 py-1 text-xs font-medium text-muted-strong backdrop-blur">
                Level {levelLabel} · {completenessPercent}% complete
              </span>
              <div className="mt-3 h-1.5 w-40 overflow-hidden rounded-full bg-white/10 lg:w-48">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-violet to-accent"
                  style={{ width: `${completenessPercent}%` }}
                />
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {displayName}
                </h1>
                <p className="mt-1 text-sm text-violet-200">{handle}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={onEditProfile}>
                  {profileExists ? "Edit profile" : "Create profile"}
                </Button>
                <Button type="button" variant="outline" onClick={onShare}>
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80">
              {bio?.trim()
                ? bio
                : "Add a short bio so partners know what you’re practicing and what feedback you want."}
            </p>
            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 backdrop-blur">
                <dt className="text-xs uppercase tracking-wide text-muted">Experience</dt>
                <dd className="mt-0.5 font-medium text-foreground">{experienceLabel}</dd>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 backdrop-blur">
                <dt className="text-xs uppercase tracking-wide text-muted">Preferred role</dt>
                <dd className="mt-0.5 font-medium text-foreground">{roleLabel}</dd>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 backdrop-blur">
                <dt className="text-xs uppercase tracking-wide text-muted">Location</dt>
                <dd className="mt-0.5 font-medium text-muted">Not set</dd>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 backdrop-blur">
                <dt className="text-xs uppercase tracking-wide text-muted">Timezone</dt>
                <dd className="mt-0.5 font-medium text-muted">Not set</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge tone="success">
                Active
              </Badge>
              <Badge tone="accent">
                {preferredRolePill}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
