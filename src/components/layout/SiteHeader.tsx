import Link from "next/link";
import { HeaderAuthNav } from "@/components/layout/HeaderAuthNav";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-background/82 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link
          href={siteConfig.routes.home}
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
        >
          <BrandLogo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="text-sm font-medium text-muted transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <HeaderAuthNav />
          <Link
            href={siteConfig.routes.signup}
            className="rounded-lg border border-accent/35 bg-accent px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(79,70,229,0.24)] transition hover:bg-accent-strong"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
