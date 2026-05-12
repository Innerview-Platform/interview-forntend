"use client";

import Link from "next/link";
import { Play, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { siteConfig } from "@/lib/site-config";
import { HeroWorkspaceFallback } from "@/components/home/marketing-visual-fallback";
import { TypingHeadline } from "@/components/home/TypingHeadline";

export function Hero() {
  return (
    <section className="relative overflow-hidden scroll-mt-20 pt-8 sm:pt-10 lg:pt-14">
      {/* Ambient depth layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(520px,70vh)] opacity-90"
      >
        <div className="absolute -left-[20%] top-8 h-72 w-[55%] rounded-full bg-accent/18 blur-[110px] iv-animate-glow" />
        <div className="absolute -right-[15%] top-32 h-80 w-[50%] rounded-full bg-accent-violet/22 blur-[120px] motion-reduce:animate-none" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-0 sm:gap-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,1.05fr)] lg:gap-16 lg:px-8">
        <div className="max-w-xl lg:max-w-none">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-soft shadow-[0_0_32px_rgba(139,92,246,0.22)] backdrop-blur-xl sm:text-xs">
            <Sparkles className="size-3.5 shrink-0 text-accent" aria-hidden />
            Live editor · video · runnable output
          </p>

          <div className="space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.06]">
              <span className="block bg-gradient-to-br from-foreground via-white to-muted-strong bg-clip-text text-transparent">
                InnerView
              </span>
              <span className="mt-2 block text-2xl font-medium leading-snug tracking-tight text-muted-strong sm:text-3xl lg:text-4xl lg:leading-snug">
                A sharper room for{" "}
              </span>
              <TypingHeadline
                accessibleTitle="InnerView: a sharper room for serious mock interviews with live code, video, and run output in one workspace."
                className="mt-1 block text-2xl font-medium leading-snug sm:text-3xl lg:text-4xl lg:leading-snug"
              />
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Practice like it&apos;s real - shared Monaco, collaborative
              cursors, Piston-backed runs, LiveKit-ready video, and a profile
              that reads like your interview story.
            </p>
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              asChild
              className="w-full shadow-[0_0_28px_rgba(139,92,246,0.35)] sm:w-auto sm:min-w-[200px]"
            >
              <Link href={siteConfig.routes.signup} className="gap-2">
                <Zap className="size-4" aria-hidden />
                Start your mock
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="#features" className="inline-flex items-center gap-2">
                <Play className="size-4 fill-current" aria-hidden />
                Explore the workspace
              </Link>
            </Button>
          </div>

          <dl className="mt-10 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Collaboration
              </dt>
              <dd className="mt-1 text-sm font-medium text-muted-strong">
                Yjs-backed editor + cursor presence
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Runtime
              </dt>
              <dd className="mt-1 text-sm font-medium text-muted-strong">
                Run output broadcast to the room
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Media
              </dt>
              <dd className="mt-1 text-sm font-medium text-muted-strong">
                P2P or LiveKit when you configure it
              </dd>
            </div>
          </dl>
        </div>

        {/* Pseudo-3D device stack */}
        <div
          className="relative mx-auto flex max-w-xl justify-center [perspective:1600px] lg:mx-0 lg:max-w-none"
          style={{ perspectiveOrigin: "50% 30%" }}
        >
          {/* Back planes */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[-8%] -z-10 rounded-[28px] border border-white/10 bg-gradient-to-br from-accent/12 via-transparent to-accent-violet/15 opacity-75 blur-xl motion-reduce:opacity-90"
          />
          <div
            aria-hidden
            className="absolute left-[6%] top-[22%] -z-[5] h-[78%] w-[88%] rounded-2xl border border-white/[0.07] bg-surface-soft/40 shadow-[0_48px_100px_rgba(0,0,0,0.45)] backdrop-blur-sm iv-animate-float-delayed"
            style={{ transform: "rotateY(-8deg) rotateX(10deg)" }}
          />

          <div className="relative z-10 w-full motion-safe:iv-animate-float">
            <div
              className="rounded-[1.65rem] border border-white/[0.14] bg-glass-bg/90 p-[10px] shadow-[0_32px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.06] backdrop-blur-2xl"
              style={{
                transform: "rotateY(-10deg) rotateX(14deg)",
                transformStyle: "preserve-3d",
              }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-b from-surface-soft/95 to-background/90 shadow-inner">
                <HeroWorkspaceFallback alt="Glassmorphism InnerView workspace with shared editor, video tiles, and run output preview" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-accent/14 via-transparent to-accent-violet/10" />

                {/* Floating HUD badges */}
                <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-5 sm:top-5">
                  <Badge tone="success">Live session</Badge>
                  <Badge tone="info">Yjs synced</Badge>
                </div>
                <div className="absolute bottom-4 right-4 flex max-w-[12rem] flex-col gap-1 rounded-xl border border-white/12 bg-black/55 px-3 py-2 text-[10px] text-muted-strong shadow-lg backdrop-blur-md sm:right-6 sm:text-xs">
                  <span className="font-mono text-accent-soft">stdin → stdout</span>
                  <span className="truncate text-muted">run · share · replay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
