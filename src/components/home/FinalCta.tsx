import Link from "next/link";
import { CreditCard, GitBranch, Rocket, Zap } from "lucide-react";
import { AbstractGlassMesh } from "@/components/home/marketing-visual-fallback";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { siteConfig } from "@/lib/site-config";

const perks = [
  { icon: CreditCard, text: "No payment wall" },
  { icon: Rocket, text: "Spin up instantly" },
  { icon: GitBranch, text: "Iterate on real infra" },
];

export function FinalCta() {
  return (
    <section
      id="cta"
      className="relative mx-auto max-w-7xl scroll-mt-20 px-4 py-0 sm:px-6 lg:px-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 bottom-24 top-28 rounded-[2.5rem] bg-gradient-to-r from-accent/25 via-accent-violet/15 to-accent/20 blur-[120px] opacity-80"
      />

      <GlassCard className="relative overflow-hidden p-0 sm:p-0">
        <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-6 p-8 text-center sm:p-12 sm:text-left">
            <p className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-soft sm:justify-start">
              <Zap className="size-3 text-accent" aria-hidden />
              Ready signal
            </p>
            <h2 className="text-[2rem] font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
              Become impossible to confuse with unprepared noise.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-muted">
              Anchor your story to a disciplined room: pacing, narration, edits,
              and runs all leave artifacts you can revisit before the onsite.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                asChild
                className="min-w-[220px] px-10 py-6 text-base shadow-[0_0_32px_rgba(139,92,246,0.45)]"
              >
                <Link href={siteConfig.routes.signup}>Claim your mock room</Link>
              </Button>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                No credit checks · Invite when you&apos;re ready
              </p>
            </div>
            <ul className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-strong sm:justify-start sm:text-sm">
              {perks.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2">
                  <Icon className="size-4 text-accent" aria-hidden />
                  <span className="uppercase tracking-wide">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative hidden min-h-[280px] border-t border-white/10 bg-gradient-to-br from-surface-soft/90 to-background/95 lg:block lg:border-l lg:border-t-0">
            <div className="absolute inset-0 overflow-hidden" aria-hidden>
              <AbstractGlassMesh className="absolute inset-0 min-h-[280px] w-full opacity-90" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/55 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/15 bg-black/65 p-4 text-left text-[13px] text-muted backdrop-blur-md">
              <p className="font-mono text-[11px] text-accent-soft">
                RoomSessionProvider → STOMP + Yjs hydrate
              </p>
              <p className="mt-3 text-muted-strong">
                The same stack you rehearse ships to recruiters as proof of fluency -
                calm hands, synced buffers, humane feedback loops.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
