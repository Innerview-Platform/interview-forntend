"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  getClientSessionSnapshot,
  getServerClientSessionSnapshot,
  subscribeClientSession,
} from "@/lib/client-session";
import { siteConfig } from "@/lib/site-config";

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim();
  if (!local) return "there";
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DashboardView() {
  const router = useRouter();

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
    </div>
  );
}
