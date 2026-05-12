"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useSyncExternalStore } from "react";
import { buildLoginUrlWithNext, clearClientSession } from "@/lib/auth-api";
import {
  getClientSessionSnapshot,
  getServerClientSessionSnapshot,
  subscribeClientSession,
} from "@/lib/client-session";
import { isAccessTokenExpired } from "@/lib/jwt-expiry";

/**
 * Guards `(app)` routes: requires access token, user id, and a JWT that is not past `exp`.
 * On failure: clears stale storage and performs one `location.replace` to login with `next`
 * (same URL shape as post-401 flow — API handlers only clear session).
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { token, user } = useSyncExternalStore(
    subscribeClientSession,
    getClientSessionSnapshot,
    getServerClientSessionSnapshot,
  );

  const jwtExpired = Boolean(token && isAccessTokenExpired(token));
  const authed = Boolean(token && user?.id && !jwtExpired);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (authed) return;
    const here = `${window.location.pathname}${window.location.search}`;
    clearClientSession();
    window.location.replace(buildLoginUrlWithNext(here));
  }, [authed, pathname]);

  if (!authed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted">
        Redirecting to sign in…
      </div>
    );
  }

  return children;
}
