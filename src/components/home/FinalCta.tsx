import Link from "next/link";
import { CreditCard, GitBranch, Rocket, Zap } from "lucide-react";
import { RoomSignalAsset } from "@/components/home/marketing-visual-fallback";
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
          <div className="space-y-6 p-8 text-center sm:p-10 sm:text-left md:p-12">
            <p className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-soft sm:justify-start">
              <Zap className="size-3 text-accent" aria-hidden />
              Ready signal
            </p>
            <h2 className="text-balance text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
              Become impossible to confuse with unprepared noise.
            </h2>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-muted sm:mx-0">
              Anchor your story to a disciplined room: pacing, narration, edits,
              and runs all leave artifacts you can revisit before the onsite.
            </p>
            <div className="mx-auto flex w-full max-w-lg flex-col items-stretch gap-3 sm:mx-0 sm:max-w-none">
              <Button
                asChild
                className="w-full px-8 py-5 text-base shadow-[0_0_32px_rgba(139,92,246,0.45)] sm:w-fit sm:min-w-[14rem] sm:px-10 sm:py-6"
              >
                <Link href={siteConfig.routes.signup}>Claim your mock room</Link>
              </Button>
              <p className="text-balance text-[11px] uppercase leading-relaxed tracking-[0.22em] text-muted sm:text-xs sm:tracking-[0.28em]">
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
            <RoomSignalAsset className="absolute inset-0 min-h-[280px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/45 to-transparent" />
            <div className="absolute inset-5 rounded-[1.75rem] border border-white/10 ring-1 ring-white/[0.04]" />
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
