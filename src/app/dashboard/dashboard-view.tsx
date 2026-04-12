"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  apiLogout,
  getStoredAccessToken,
  getStoredUser,
} from "@/lib/auth-api";
import { siteConfig } from "@/lib/site-config";

export function DashboardView() {
  const router = useRouter();
  const [user, setUser] = useState(() => getStoredUser());
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
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 py-16">
      <GlassCard className="p-8 sm:p-10">
        <p className="text-sm font-medium uppercase tracking-wider text-muted">
          Account
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Welcome back
        </h1>
        <p className="mt-3 text-sm text-muted">
          You&apos;re signed in. Details below are from your session after the
          last successful login.
        </p>
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
          <p className="mt-6 text-sm text-muted">Loading…</p>
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
    </div>
  );
}
