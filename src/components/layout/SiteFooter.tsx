import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-muted sm:flex-row sm:text-left sm:px-6 lg:px-8">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. Mock interviews only -
          no data leaves your session in this demo.
        </p>
        <div className="flex gap-6">
          <Link href="/login" className="hover:text-accent">
            Sign In
          </Link>
          <Link href="/signup" className="hover:text-accent">
            Sign Up
          </Link>
        </div>
      </div>
    </footer>
  );
}
