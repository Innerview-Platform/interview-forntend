import Link from "next/link";
import { Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pb-28 lg:pt-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-accent shadow-[0_0_24px_rgba(192,132,252,0.2)] backdrop-blur">
          <Sparkles className="size-3.5" aria-hidden />
          Profiles, skills, and structured practice
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Interview with{" "}
          <span className="bg-gradient-to-r from-accent to-accent-strong bg-clip-text text-transparent">
            confidence.
          </span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          A mock interview workspace for developers: build your profile, tag your
          stacks, track feedback and interview history, and sign in securely
          (including Google). Live video and shared coding sessions are planned
          — we&apos;re focusing on a solid profile and auth experience first.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild className="w-full min-w-[200px] sm:w-auto">
            <Link href={siteConfig.routes.signup}>Start your mock</Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="#features" className="inline-flex items-center gap-2">
              <Play className="size-4 fill-current" aria-hidden />
              See what&apos;s included
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
