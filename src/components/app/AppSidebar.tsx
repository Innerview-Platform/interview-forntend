"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Home,
  LayoutDashboard,
  Mic,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { siteConfig } from "@/lib/site-config";

type Props = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

const generalNav = [
  {
    href: siteConfig.routes.home,
    label: "Home",
    icon: Home,
  },
  {
    href: siteConfig.routes.dashboard,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: siteConfig.routes.profile,
    label: "Profile",
    icon: UserRound,
  },
  {
    href: siteConfig.routes.problems,
    label: "Problems",
    icon: BookOpen,
  },
  {
    href: siteConfig.routes.dashboard,
    label: "Mock interviews",
    icon: Mic,
    disabled: true,
  },
] as const;

const analyticsNav = [
  {
    href: "/dashboard",
    label: "Analytics",
    icon: BarChart3,
    disabled: true,
  },
] as const;

const accountNav = [
  {
    href: siteConfig.routes.profile,
    label: "Account",
    icon: UserRound,
  },
] as const;

export function AppSidebar({ mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname();

  function rowActive(href: string, exact?: boolean): boolean {
    if (href === siteConfig.routes.home) return pathname === "/";
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function NavButton({
    href,
    label,
    icon: Icon,
    disabled,
  }: {
    href: string;
    label: string;
    icon: typeof Home;
    disabled?: boolean;
  }) {
    const active = !disabled && rowActive(href, href === siteConfig.routes.home);
    const base =
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition";
    const activeCls =
      "border-l-2 border-accent bg-accent/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";
    const idleCls =
      "border-l-2 border-transparent text-white/75 hover:bg-white/5 hover:text-foreground";

    if (disabled) {
      return (
        <span
          className={`${base} cursor-not-allowed opacity-45 ${idleCls}`}
          title="Coming soon"
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </span>
      );
    }

    return (
      <Link
        href={href}
        className={`${base} ${active ? activeCls : idleCls}`}
        onClick={onMobileClose}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        onClick={onMobileClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-white/10 bg-background/95 backdrop-blur-xl transition-transform md:static md:z-0 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 md:hidden">
          <span className="text-sm font-semibold text-foreground">Menu</span>
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-2 text-muted hover:bg-white/10 hover:text-foreground"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-6 px-3 pb-6 pt-2 md:pt-6">
          <div>
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              General
            </p>
            <nav className="flex flex-col gap-1">
              {generalNav.map((item) => (
                <NavButton key={item.label} {...item} />
              ))}
            </nav>
          </div>
          <div>
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Analytics
            </p>
            <nav className="flex flex-col gap-1">
              {analyticsNav.map((item) => (
                <NavButton key={item.label} {...item} />
              ))}
            </nav>
          </div>
          <div>
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Account
            </p>
            <nav className="flex flex-col gap-1">
              {accountNav.map((item) => (
                <NavButton key={item.label} {...item} />
              ))}
            </nav>
          </div>
          <div className="mt-auto rounded-xl border border-white/10 bg-surface-soft/70 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-accent" />
              Practice toolkit
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Analytics and scheduling controls are queued for the next product pass.
            </p>
            <button
              type="button"
              className="mt-3 w-full rounded-lg border border-white/10 bg-white/[0.05] py-2 text-xs font-medium text-muted-strong transition hover:bg-white/[0.08]"
            >
              Coming soon
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
