"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  apiDashboardTest,
  apiLogout,
  getStoredAccessToken,
  getStoredUser,
} from "@/lib/auth-api";
import { siteConfig } from "@/lib/site-config";

export function DashboardView() {
  const router = useRouter();
  const [user, setUser] = useState(() => getStoredUser());
  const [probe, setProbe] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const token = getStoredAccessToken();
    const profile = getStoredUser();
    if (!token || !profile?.id) {
      router.replace(siteConfig.routes.login);
      return;
    }
    setUser(profile);

    let cancelled = false;
    void (async () => {
      try {
        const r = await apiDashboardTest();
        if (cancelled) return;
        if (r.ok) {
          setProbe(r.body);
        } else {
          setProbe(
            `HTTP ${r.status} — ${r.body || "(empty)"}\n` +
              "Note: this endpoint is intended for OAuth2 sessions; JWT sign-in may receive 401.",
          );
        }
      } catch {
        if (!cancelled) setProbe("Could not reach dashboard-test.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    setLogoutError(null);
    setLoggingOut(true);
    try {
      await apiLogout();
      router.replace(siteConfig.routes.login);
    } catch (e) {
      setLogoutError(e instanceof Error ? e.message : "Logout failed.");
    } finally {
      setLoggingOut(false);
    }
  }

  if (
    typeof window !== "undefined" &&
    (!getStoredAccessToken() || !getStoredUser()?.id)
  ) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-muted">
        Redirecting to sign in…
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-16">
      <GlassCard className="p-8 sm:p-10">
        <p className="text-sm font-medium uppercase tracking-wider text-muted">
          Your profile
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Welcome back
        </h1>
        {user ? (
          <dl className="mt-8 space-y-4 text-sm">
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
        ) : (
          <p className="mt-6 text-sm text-muted">Loading profile…</p>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Signing out…" : "Sign out"}
          </Button>
          <Link
            href={siteConfig.routes.home}
            className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-foreground transition hover:border-white/25 hover:bg-white/5"
          >
            Home
          </Link>
        </div>
        {logoutError ? (
          <p className="mt-4 text-sm text-red-400" role="alert">
            {logoutError}
          </p>
        ) : null}
      </GlassCard>

      <GlassCard className="p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          API · GET /api/auth/dashboard-test
        </p>
        <pre className="mt-4 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/30 p-4 text-xs text-foreground/85">
          {probe ?? "Loading…"}
        </pre>
      </GlassCard>
    </div>
  );
}
