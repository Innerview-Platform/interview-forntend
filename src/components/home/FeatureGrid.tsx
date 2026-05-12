import {
  ArrowUpRight,
  Code2,
  History,
  Shield,
  UserRound,
  Video,
} from "lucide-react";
import { AbstractGlassMesh } from "@/components/home/marketing-visual-fallback";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";

export function FeatureGrid() {
  return (
    <section
      id="features"
      className="relative mx-auto max-w-7xl scroll-mt-20 overflow-hidden px-4 py-0 sm:px-6 lg:px-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-64 w-[min(1400px,100%)] -translate-x-1/2 rounded-full bg-gradient-to-r from-accent/15 via-transparent to-accent-violet/20 blur-3xl"
      />

      <div className="relative space-y-14">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-soft">
            Capability map
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            The modern interview stack, without the juggling.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            Opinionated layout, open protocol: everything funnels through room
            signaling, profile APIs, and realtime editor state you can explain
            clearly to interviewers.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-12 xl:grid-rows-2">
          <GlassCard className="relative overflow-hidden p-6 transition-transform duration-500 motion-safe:hover:-translate-y-1 motion-reduce:hover:translate-y-0 md:p-8 xl:col-span-5 xl:row-span-2">
            <div className="relative z-10 mb-6 flex items-center gap-4">
              <span className="flex size-11 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-accent/30 to-accent-strong/10 text-white shadow-[0_14px_44px_rgba(99,102,241,0.28)]">
                <UserRound className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Profile graph
                </p>
                <h3 className="text-xl font-semibold tracking-tight">
                  Your story, API-coherent
                </h3>
              </div>
            </div>
            <p className="relative z-10 text-sm leading-relaxed text-muted md:text-[15px]">
              Signals like role focus, bios, avatar URLs and interview history
              stay aligned with InnerView endpoints so dashboards and recruiter
              hand-offs feel intentional - not scraped together.
            </p>
            <div className="relative z-10 mt-8 rounded-2xl border border-white/10 bg-surface-soft/85 p-4 text-xs leading-relaxed text-muted-strong shadow-inner">
              <p className="font-mono text-[11px] text-accent-soft">
                GET /api/profile
              </p>
              <p className="mt-3 text-sm text-muted">
                Mirrors what you polish in-product; ready for recruiter-friendly
                explainers or PDF exports later.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge tone="success">strength radar</Badge>
                <Badge tone="neutral">stack tags</Badge>
                <Badge tone="info">feedback trail</Badge>
              </div>
            </div>
            <ArrowUpRight
              className="absolute right-4 top-4 size-5 text-muted opacity-70"
              aria-hidden
            />
          </GlassCard>

          <GlassCard className="group relative overflow-hidden p-6 md:p-7 xl:col-span-7">
            <div className="absolute inset-y-6 right-0 hidden w-[45%] overflow-hidden rounded-2xl border border-white/[0.08] bg-black/55 md:block lg:w-[43%]">
              <AbstractGlassMesh className="absolute inset-0 opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/85 to-background" />
            </div>
            <div className="relative z-10 max-w-xl">
              <span className="flex size-12 items-center justify-center rounded-2xl border border-success/30 bg-success/12 text-success">
                <Code2 className="size-6" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">
                Shared coding workspace
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted md:text-[15px]">
                Monaco + Yjs for conflict-free merges, websocket cursors so
                narration matches what everyone sees on-screen, compile fan-out
                with shared stdout/stderr.
              </p>
              <span className="mt-8 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-accent transition group-hover:translate-x-1">
                See it inside a room{" "}
                <ArrowUpRight className="size-3.5" aria-hidden />
              </span>
            </div>
          </GlassCard>

          <GlassCard className="p-6 transition-transform duration-500 motion-safe:hover:-translate-y-1 motion-reduce:hover:translate-y-0 xl:col-span-4">
            <Video className="mb-5 size-8 text-accent" aria-hidden />
            <h3 className="text-lg font-semibold tracking-tight">
              Fluid video transport
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Lightweight P2P path or LiveKit SFU toggle - whichever your org
              already trusts - mirrored beside the IDE instead of burying facial
              cues.
            </p>
          </GlassCard>

          <GlassCard className="p-6 transition-transform duration-500 motion-safe:hover:-translate-y-1 motion-reduce:hover:translate-y-0 xl:col-span-4">
            <History className="mb-5 size-8 text-warning" aria-hidden />
            <h3 className="text-lg font-semibold tracking-tight">
              History worth referencing
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Interview timelines and reviewer notes stay close to the REST
              graph so you rehearse anecdotes with receipts.
            </p>
          </GlassCard>

          <GlassCard className="p-6 transition-transform duration-500 motion-safe:hover:-translate-y-1 motion-reduce:hover:translate-y-0 xl:col-span-4">
            <Shield className="mb-5 size-8 text-success" aria-hidden />
            <h3 className="text-lg font-semibold tracking-tight">
              Hardened auth flows
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Email + password, Google OAuth, refresh cookies on{" "}
              <code className="rounded bg-white/10 px-1 text-xs">/api/auth</code>
              , short-lived JWT for protected apps.
            </p>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
