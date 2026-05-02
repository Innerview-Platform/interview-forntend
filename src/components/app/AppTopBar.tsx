"use client";

import Link from "next/link";
import { Bell, Menu, Search } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { UserMenu } from "@/components/app/UserMenu";

type Props = {
  onMenuOpen: () => void;
};

export function AppTopBar({ onMenuOpen }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0815]/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={onMenuOpen}
          className="rounded-xl p-2 text-foreground hover:bg-white/10 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link
          href={siteConfig.routes.home}
          className="text-base font-semibold tracking-tight text-foreground"
        >
          {siteConfig.name}
        </Link>
        <nav className="ml-4 hidden items-center gap-5 md:flex">
          <Link
            href={siteConfig.routes.dashboard}
            className="text-sm text-white/75 transition hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href={siteConfig.routes.profile}
            className="text-sm text-white/75 transition hover:text-foreground"
          >
            Profile
          </Link>
        </nav>
        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3 md:max-w-md md:flex-initial lg:max-w-lg">
          <label className="relative hidden min-w-0 flex-1 md:block">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              readOnly
              placeholder="Search (coming soon)"
              className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted focus-visible:border-violet-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
            />
          </label>
          <button
            type="button"
            className="relative rounded-full border border-white/10 bg-white/5 p-2 text-foreground transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500/50"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent-strong shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
