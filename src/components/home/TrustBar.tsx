import { Cpu, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { AbstractGlassMesh } from "@/components/home/marketing-visual-fallback";

const capabilities = ["Shared editor", "Video-ready", "Live run output", "Problems"];

const pillars = [
  {
    icon: Layers,
    label: "One surface",
    detail: "Code + camera + transcript-style output beside each other.",
  },
  {
    icon: Cpu,
    label: "Engineering-native",
    detail: "Monaco + Yjs code sync; compile results fan out on STOMP.",
  },
  {
    icon: ShieldCheck,
    label: "Auth built-in",
    detail: "JWT-first flows with refresh-friendly cookies.",
  },
];

export function TrustBar() {
  return (
    <section className="relative overflow-hidden border-y border-white/[0.08] bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,rgba(99,102,241,0.16),transparent_55%)] bg-surface/65 py-10 backdrop-blur-md md:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen [mask-image:radial-gradient(ellipse_95%_80%_at_50%_30%,black,transparent)]"
      >
        <AbstractGlassMesh className="absolute inset-0 min-h-full w-full" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:gap-12 sm:px-6 lg:grid-cols-[1.05fr_auto] lg:items-center lg:gap-14 lg:px-8">
        <div className="space-y-4 text-center lg:text-left">
          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-soft lg:justify-start">
            <Sparkles className="size-3 text-accent" aria-hidden />
            Built today for remote technical interviews
          </div>
          <p className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Everything that usually splinters across four tabs - now behaves
            like one disciplined stage.
          </p>
          <p className="text-sm leading-relaxed text-muted sm:text-base">
            InnerView trims context switching so you rehearse pacing, narration,
            and execution the way Staff+ loops expect.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <ul className="flex flex-wrap items-center justify-center gap-3 lg:justify-end">
            {capabilities.map((name) => (
              <li
                key={name}
                className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-strong backdrop-blur-sm transition-colors hover:border-accent/45 hover:text-foreground"
              >
                {name}
              </li>
            ))}
          </ul>
          <div className="grid gap-3 sm:grid-cols-3">
            {pillars.map(({ icon: Icon, label, detail }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/[0.1] bg-black/35 p-4 text-left shadow-inner shadow-accent/10 transition-transform duration-500 motion-safe:hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
              >
                <Icon className="mb-3 size-5 text-accent" aria-hidden />
                <p className="text-[13px] font-semibold tracking-tight text-foreground">
                  {label}
                </p>
                <p className="mt-1 text-xs leading-snug text-muted">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
