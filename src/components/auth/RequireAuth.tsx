"use client";

import { useRouter, usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { useSyncExternalStore } from "react";
import {
  getClientSessionSnapshot,
  getServerClientSessionSnapshot,
  subscribeClientSession,
} from "@/lib/client-session";
import { siteConfig } from "@/lib/site-config";

/**
 * Guards `(app)` routes: no access token → redirect to login with `next` return URL.
 * Uses a mounted gate to avoid SSR/client hydration mismatches with localStorage.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { token, user } = useSyncExternalStore(
    subscribeClientSession,
    getClientSessionSnapshot,
    getServerClientSessionSnapshot,
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (token && user?.id) return;
    const here =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : pathname;
    router.replace(
      `${siteConfig.routes.login}?next=${encodeURIComponent(here)}`,
    );
  }, [mounted, token, user?.id, pathname, router]);

  if (!mounted) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted">
        Loading…
      </div>
    );
  }

  if (!token || !user?.id) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted">
        Redirecting to sign in…
      </div>
    );
  }

  return children;
}
