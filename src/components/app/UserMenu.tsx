"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  apiLogout,
  getStoredUser,
  INNERVIEW_AUTH_CHANGED_EVENT,
  type StoredUser,
} from "@/lib/auth-api";
import { siteConfig } from "@/lib/site-config";
import { useAppShell } from "@/components/app/app-shell-context";

function displayNameFromUser(user: StoredUser | null): string {
  if (!user?.email) return "User";
  const local = user.email.split("@")[0]?.trim();
  if (!local) return "User";
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function handleFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "user";
  return local.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 32) || "user";
}

function initials(name: string, email: string): string {
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

export function UserMenu() {
  const router = useRouter();
  const { headerAvatarUrl } = useAppShell();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const syncUser = useCallback(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    syncUser();
    function onAuth() {
      syncUser();
    }
    window.addEventListener(INNERVIEW_AUTH_CHANGED_EVENT, onAuth);
    return () => window.removeEventListener(INNERVIEW_AUTH_CHANGED_EVENT, onAuth);
  }, [syncUser]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const name = displayNameFromUser(user);
  const email = user?.email ?? "";
  const handle = email ? `@${handleFromEmail(email)}` : "@user";
  const avatarSrc = headerAvatarUrl?.trim() || null;
  const ini = initials(name, email);

  async function onLogout() {
    setLoggingOut(true);
    try {
      await apiLogout();
      router.replace(siteConfig.routes.login);
    } catch {
      router.replace(siteConfig.routes.login);
    } finally {
      setLoggingOut(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-[16rem] items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1.5 pl-1.5 pr-2.5 text-left backdrop-blur transition hover:border-white/25 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500/60"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {avatarSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarSrc}
            alt=""
            className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-violet-500/50"
          />
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-accent-strong text-xs font-semibold text-white ring-2 ring-violet-500/50">
            {ini}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {name}
          </span>
          <span className="block truncate text-xs text-muted">{handle}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 rounded-2xl border border-white/10 bg-[#120b24]/95 py-2 shadow-xl shadow-black/40 backdrop-blur-xl"
        >
          <Link
            role="menuitem"
            href={siteConfig.routes.profile}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground transition hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            <UserRound className="h-4 w-4 text-muted" />
            Profile
          </Link>
          <Link
            role="menuitem"
            href={siteConfig.routes.dashboard}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground transition hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard className="h-4 w-4 text-muted" />
            Dashboard
          </Link>
          <div className="my-2 border-t border-white/10" />
          <button
            type="button"
            role="menuitem"
            disabled={loggingOut}
            onClick={onLogout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-200 transition hover:bg-red-500/15 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
