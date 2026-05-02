"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppShell } from "@/components/app/app-shell-context";
import { AvailabilityCard } from "@/components/profile/AvailabilityCard";
import { InterviewHistoryTable } from "@/components/profile/InterviewHistoryTable";
import { ProfileCompletenessCard } from "@/components/profile/ProfileCompletenessCard";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { RecentFeedbackCard } from "@/components/profile/RecentFeedbackCard";
import { SkillsSection } from "@/components/profile/SkillsSection";
import { StatCardsRow } from "@/components/profile/StatCardsRow";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { getStoredAccessToken, getStoredUser } from "@/lib/auth-api";
import {
  apiAddMyLanguage,
  apiCreateLanguage,
  apiCreateProfile,
  apiDeleteProfile,
  apiGetFeedbackGiven,
  apiGetFeedbackReceived,
  apiGetInterviews,
  apiGetProfile,
  apiGetRating,
  apiListAllLanguages,
  apiListMyLanguages,
  apiRemoveMyLanguage,
  apiUpdateProfile,
  apiUploadProfileImage,
  EXPERIENCE_LEVELS,
  type ExperienceLevel,
  type FeedbackItem,
  type InterviewHistoryItem,
  type PreferredRole,
  PREFERRED_ROLES,
  type ProfileDto,
  type ProgrammingLanguageDto,
  type SpringPage,
  type UserRatingDto,
} from "@/lib/profile-api";
import { siteConfig } from "@/lib/site-config";

const experienceLabels: Record<ExperienceLevel, string> = {
  STUDENT: "Student",
  FRESH_GRADUATE: "Fresh graduate",
  JUNIOR: "Junior",
  MID_LEVEL: "Mid-level",
  SENIOR: "Senior",
};

const roleLabels: Record<PreferredRole, string> = {
  INTERVIEWER: "Interviewer",
  INTERVIEWEE: "Interviewee",
  BOTH: "Both",
};

/** Native selects: solid fill + light text + dark color-scheme for readable option lists (esp. Windows). */
const PROFILE_SELECT_BASE =
  "min-w-0 rounded-xl border border-white/25 bg-[#1a142e] px-3 py-2.5 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] outline-none [color-scheme:dark] transition focus-visible:border-violet-400/70 focus-visible:ring-2 focus-visible:ring-violet-500/40 disabled:opacity-50";

const PROFILE_SELECT_CLASS = `w-full ${PROFILE_SELECT_BASE}`;

const PROFILE_OPTION_CLASS = "bg-[#1a142e] text-white";

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim();
  if (!local) return "User";
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function handleFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "user";
  const s = local.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 32);
  return `@${s || "user"}`;
}

function initialsFromUser(email: string, name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const e = email.split("@")[0] ?? "?";
  return e.slice(0, 2).toUpperCase();
}

function completenessPercent(args: {
  profile: ProfileDto | null | undefined;
  bio: string;
  imageUrl: string;
  myLangs: ProgrammingLanguageDto[];
  rating: UserRatingDto | null;
  interviews: SpringPage<InterviewHistoryItem> | null;
}): number {
  let score = 0;
  const hasProfile = args.profile != null;
  if (hasProfile) score += 20;
  if (args.bio.trim()) score += 20;
  const img =
    (args.profile?.image_url?.trim() || args.imageUrl.trim()).length > 0;
  if (img) score += 20;
  if (args.myLangs.length > 0) score += 20;
  const engaged =
    (args.rating?.total_reviews ?? 0) > 0 ||
    (args.interviews?.totalElements ?? 0) > 0;
  if (engaged) score += 20;
  return score;
}

function preferredRolePill(role: PreferredRole): string {
  if (role === "INTERVIEWEE") return "Open to practice";
  if (role === "INTERVIEWER") return "Offering interviews";
  return "Interviewer & interviewee";
}

export function ProfileView() {
  const router = useRouter();
  const { setHeaderAvatarUrl } = useAppShell();
  const editSectionRef = useRef<HTMLDivElement>(null);

  const [token, setTokenState] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileDto | null | undefined>(
    undefined,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>("JUNIOR");
  const [preferredRole, setPreferredRole] =
    useState<PreferredRole>("INTERVIEWEE");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [myLangs, setMyLangs] = useState<ProgrammingLanguageDto[]>([]);
  const [catalog, setCatalog] = useState<ProgrammingLanguageDto[]>([]);
  const [selectedLangId, setSelectedLangId] = useState<string>("");
  const [newLangName, setNewLangName] = useState("");
  const [langBusy, setLangBusy] = useState(false);

  const [rating, setRating] = useState<UserRatingDto | null>(null);
  const [interviews, setInterviews] =
    useState<SpringPage<InterviewHistoryItem> | null>(null);
  const [feedbackIn, setFeedbackIn] = useState<SpringPage<FeedbackItem> | null>(
    null,
  );
  const [feedbackOut, setFeedbackOut] = useState<SpringPage<FeedbackItem> | null>(
    null,
  );

  const refreshLanguages = useCallback(async () => {
    const [mine, all] = await Promise.all([
      apiListMyLanguages(),
      apiListAllLanguages(),
    ]);
    setMyLangs(mine);
    setCatalog(all);
  }, []);

  const refreshInsights = useCallback(async (uid: string) => {
    try {
      const [r, iv, fin, fout] = await Promise.all([
        apiGetRating(uid),
        apiGetInterviews(uid, { page: 0, size: 20 }),
        apiGetFeedbackReceived(uid, { page: 0, size: 20 }),
        apiGetFeedbackGiven(uid, { page: 0, size: 20 }),
      ]);
      setRating(r);
      setInterviews(iv);
      setFeedbackIn(fin);
      setFeedbackOut(fout);
    } catch {
      setRating(null);
      setInterviews(null);
      setFeedbackIn(null);
      setFeedbackOut(null);
    }
  }, []);

  useEffect(() => {
    const t = getStoredAccessToken();
    const u = getStoredUser();
    setTokenState(t);
    setUserId(u?.id ?? null);
    setUserEmail(u?.email ?? "");
    if (!t || !u?.id) {
      router.replace(siteConfig.routes.login);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await apiGetProfile();
        if (cancelled) return;
        setProfile(p);
        if (p) {
          setExperienceLevel(p.experience_level);
          setPreferredRole(p.preferred_role);
          setBio(p.bio ?? "");
          setImageUrl(p.image_url ?? "");
          setEditOpen(false);
        } else {
          setEditOpen(true);
        }
        await refreshLanguages();
        await refreshInsights(u.id);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, refreshLanguages, refreshInsights]);

  useEffect(() => {
    const resolved =
      profile?.image_url?.trim() || imageUrl.trim() || null;
    setHeaderAvatarUrl(resolved);
    return () => setHeaderAvatarUrl(null);
  }, [profile?.image_url, imageUrl, setHeaderAvatarUrl]);

  async function handleSaveCreate() {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      if (!profile) {
        const p = await apiCreateProfile({
          experience_level: experienceLevel,
          preferred_role: preferredRole,
          bio: bio.trim() || null,
          image_url: imageUrl.trim() || null,
        });
        setProfile(p);
        setEditOpen(false);
      } else {
        const p = await apiUpdateProfile({
          experience_level: experienceLevel,
          preferred_role: preferredRole,
          bio: bio.trim() || null,
          image_url: imageUrl.trim() || null,
        });
        setProfile(p);
      }
      if (userId) await refreshInsights(userId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !profile ||
      !window.confirm("Delete your profile? This cannot be undone.")
    )
      return;
    setSaving(true);
    setError(null);
    try {
      await apiDeleteProfile();
      setProfile(null);
      setBio("");
      setImageUrl("");
      setMyLangs([]);
      setEditOpen(true);
      await refreshInsights(userId!);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setSaving(true);
    setError(null);
    try {
      const p = await apiUploadProfileImage(file);
      setProfile(p);
      setImageUrl(p.image_url ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  }

  async function handleAddLanguage() {
    const id = Number.parseInt(selectedLangId, 10);
    if (!Number.isFinite(id)) return;
    setLangBusy(true);
    setError(null);
    try {
      await apiAddMyLanguage(id);
      await refreshLanguages();
      setSelectedLangId("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add language");
    } finally {
      setLangBusy(false);
    }
  }

  async function handleCreateLanguage() {
    const name = newLangName.trim();
    if (!name) return;
    setLangBusy(true);
    setError(null);
    try {
      await apiCreateLanguage(name);
      setNewLangName("");
      await refreshLanguages();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create language");
    } finally {
      setLangBusy(false);
    }
  }

  async function handleRemoveLanguage(id: number) {
    setLangBusy(true);
    setError(null);
    try {
      await apiRemoveMyLanguage(id);
      await refreshLanguages();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove language");
    } finally {
      setLangBusy(false);
    }
  }

  function openEdit() {
    setEditOpen(true);
    requestAnimationFrame(() => {
      editSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function onShareProfile() {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}/profile` : "";
    if (!url) return;
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(url).catch(() => {
        /* ignore */
      });
      return;
    }
  }

  if (!token || !userId) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-muted">
        Redirecting…
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-muted">
        Loading profile…
      </div>
    );
  }

  const availableToAdd = catalog.filter(
    (c) => !myLangs.some((m) => m.id === c.id),
  );

  const displayImageSrc =
    profile?.image_url?.trim() || imageUrl.trim() || null;
  const displayName = userEmail
    ? displayNameFromEmail(userEmail)
    : "User";
  const handle = userEmail ? handleFromEmail(userEmail) : "@user";
  const initials = initialsFromUser(userEmail, displayName);
  const pct = completenessPercent({
    profile: profile ?? null,
    bio,
    imageUrl,
    myLangs,
    rating,
    interviews,
  });

  const stats = [
    {
      label: "Average rating",
      value:
        rating && rating.total_reviews > 0
          ? rating.average_rating.toFixed(1)
          : "—",
      hint:
        rating && rating.total_reviews > 0
          ? `${rating.total_reviews} review${rating.total_reviews === 1 ? "" : "s"}`
          : "No reviews yet",
    },
    {
      label: "Total reviews",
      value: rating ? String(rating.total_reviews) : "—",
      hint: "All-time feedback count",
    },
    {
      label: "Interviews",
      value: interviews ? String(interviews.totalElements) : "0",
      hint: "Recorded in history",
    },
    {
      label: "Languages",
      value: String(myLangs.length),
      hint: "Skills on your profile",
    },
  ];

  const interviewRows = interviews?.content ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-5 sm:py-10">
      <div className="mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Profile
        </p>
        <p className="mt-1 text-sm text-muted">
          Dashboard view · session data from your last login.
        </p>
      </div>

      {error ? (
        <p className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <ProfileHero
        displayName={displayName}
        handle={handle}
        bio={bio.trim() ? bio : profile?.bio ?? null}
        experienceLabel={experienceLabels[experienceLevel]}
        roleLabel={roleLabels[preferredRole]}
        imageSrc={displayImageSrc}
        initials={initials}
        profileExists={!!profile}
        completenessPercent={pct}
        preferredRolePill={preferredRolePill(preferredRole)}
        onEditProfile={openEdit}
        onShare={onShareProfile}
      />

      <div className="mt-8">
        <StatCardsRow stats={stats} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:items-start">
        <div className="flex min-w-0 flex-col gap-8">
          <SkillsSection
            myLangs={myLangs}
            catalogFiltered={availableToAdd}
            selectedLangId={selectedLangId}
            onSelectLangId={setSelectedLangId}
            onAddLanguage={handleAddLanguage}
            newLangName={newLangName}
            onNewLangName={setNewLangName}
            onCreateLanguage={handleCreateLanguage}
            langBusy={langBusy}
            onRemoveLanguage={handleRemoveLanguage}
          />

          <InterviewHistoryTable rows={interviewRows} />

          <GlassCard className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground">
              Feedback you gave
            </h2>
            {!feedbackOut || feedbackOut.content.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No feedback given yet.</p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {feedbackOut.content.map((f, i) => (
                  <li
                    key={`g-${f.interview_id}-${i}`}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <span className="font-medium text-foreground">
                      {f.rating}/5
                    </span>
                    <span className="text-muted"> · </span>
                    <span>{f.comment || "No comment"}</span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
          <ProfileCompletenessCard percent={pct} />
          <AvailabilityCard />
          <RecentFeedbackCard items={feedbackIn?.content ?? []} />
        </aside>
      </div>

      <div ref={editSectionRef} className="mt-12 scroll-mt-28">
        <GlassCard className="overflow-hidden p-0 sm:p-0">
          <button
            type="button"
            onClick={() => setEditOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-white/[0.03] sm:px-8"
            aria-expanded={editOpen}
          >
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {profile ? "Edit profile" : "Create profile"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Experience, preferences, bio, and photo · saves to the same APIs as
                before.
              </p>
            </div>
            <span className="shrink-0 text-sm text-violet-200">
              {editOpen ? "Hide" : "Show"}
            </span>
          </button>
          {editOpen ? (
            <div className="border-t border-white/10 px-6 pb-8 pt-2 sm:px-8">
              {profile && displayImageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayImageSrc}
                  alt=""
                  className="mt-4 h-24 w-24 rounded-2xl object-cover ring-1 ring-white/15"
                />
              ) : null}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-muted">Experience level</span>
                  <select
                    value={experienceLevel}
                    onChange={(e) =>
                      setExperienceLevel(e.target.value as ExperienceLevel)
                    }
                    className={PROFILE_SELECT_CLASS}
                  >
                    {EXPERIENCE_LEVELS.map((v) => (
                      <option key={v} value={v} className={PROFILE_OPTION_CLASS}>
                        {experienceLabels[v]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-muted">Preferred role</span>
                  <select
                    value={preferredRole}
                    onChange={(e) =>
                      setPreferredRole(e.target.value as PreferredRole)
                    }
                    className={PROFILE_SELECT_CLASS}
                  >
                    {PREFERRED_ROLES.map((v) => (
                      <option key={v} value={v} className={PROFILE_OPTION_CLASS}>
                        {roleLabels[v]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-4 flex flex-col gap-2 text-sm">
                <span className="text-muted">Bio</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-foreground"
                  placeholder="Tell others about your background…"
                />
              </label>

              <label className="mt-4 flex flex-col gap-2 text-sm">
                <span className="text-muted">Image URL (optional)</span>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-foreground"
                  placeholder="https://…"
                />
              </label>

              {profile ? (
                <label className="mt-4 flex cursor-pointer flex-col gap-2 text-sm">
                  <span className="text-muted">Upload profile image</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-foreground"
                    onChange={handleImageFile}
                    disabled={saving}
                  />
                </label>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="button" disabled={saving} onClick={handleSaveCreate}>
                  {saving
                    ? "Saving…"
                    : profile
                      ? "Save changes"
                      : "Create profile"}
                </Button>
                {profile ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={handleDelete}
                  >
                    Delete profile
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </GlassCard>
      </div>
    </div>
  );
}
