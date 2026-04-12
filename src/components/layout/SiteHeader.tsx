import Link from "next/link";
import { HeaderAuthNav } from "@/components/layout/HeaderAuthNav";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0b0815]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href={siteConfig.routes.home}
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          {siteConfig.name}
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="text-sm text-white/80 transition hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <HeaderAuthNav />
          <Link
            href={siteConfig.routes.signup}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-[#0b0815] shadow-[0_0_20px_rgba(192,132,252,0.35)] transition hover:bg-accent-strong hover:shadow-[0_0_28px_rgba(192,132,252,0.5)]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
