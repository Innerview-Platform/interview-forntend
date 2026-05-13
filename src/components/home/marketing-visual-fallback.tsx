/**
 * CSS-only stand-ins for missing /brand/*.png assets (dev-friendly, no binaries).
 */

const meshLayers =
  "pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-[#0b1020] to-violet-950/50";

export function AbstractGlassMesh({
  className = "relative min-h-full w-full",
}: {
  className?: string;
}) {
  return (
    <div aria-hidden className={`overflow-hidden ${className}`.trim()}>
      <div className={`${meshLayers}`} />
      <div className="pointer-events-none absolute -right-[25%] top-[-20%] h-[85%] w-[70%] rounded-full bg-violet-500/25 blur-[90px]" />
      <div className="pointer-events-none absolute -left-[15%] bottom-[-30%] h-[70%] w-[55%] rounded-full bg-cyan-500/10 blur-[80px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -12deg,
            transparent,
            transparent 12px,
            rgba(255,255,255,0.06) 12px,
            rgba(255,255,255,0.06) 13px
          )`,
        }}
      />
    </div>
  );
}

export function RoomSignalAsset({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none relative min-h-full overflow-hidden bg-[#070b14] ${className}`.trim()}
    >
      <AbstractGlassMesh className="absolute inset-0 opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(139,92,246,0.32),transparent_36%),radial-gradient(circle_at_30%_78%,rgba(34,211,238,0.16),transparent_34%)]" />
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="absolute left-[12%] top-[14%] h-[58%] w-[74%] rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md" />
      <div className="absolute left-[18%] top-[21%] h-24 w-[48%] rounded-2xl border border-accent/25 bg-black/45 p-3 shadow-[0_0_36px_rgba(139,92,246,0.22)]">
        <div className="mb-3 flex items-center gap-2">
          <span className="size-2 rounded-full bg-success" />
          <span className="h-2 w-20 rounded-full bg-white/20" />
        </div>
        <div className="space-y-2">
          <span className="block h-2 w-[86%] rounded-full bg-accent/45" />
          <span className="block h-2 w-[62%] rounded-full bg-white/15" />
          <span className="block h-2 w-[72%] rounded-full bg-cyan-300/25" />
        </div>
      </div>

      <div className="absolute right-[13%] top-[28%] h-24 w-28 rounded-2xl border border-white/12 bg-black/55 p-3 shadow-xl backdrop-blur-md">
        <div className="grid h-full grid-cols-2 gap-2">
          <span className="rounded-xl bg-accent/35" />
          <span className="rounded-xl bg-white/12" />
          <span className="rounded-xl bg-cyan-300/20" />
          <span className="rounded-xl bg-success/25" />
        </div>
      </div>

      <div className="absolute bottom-[17%] left-[23%] flex items-center gap-2 rounded-full border border-white/12 bg-black/60 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-soft shadow-lg backdrop-blur-md">
        <span className="size-1.5 rounded-full bg-accent shadow-[0_0_16px_rgba(139,92,246,0.9)]" />
        STOMP
      </div>
      <div className="absolute bottom-[21%] right-[18%] rounded-full border border-white/12 bg-black/60 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100/80 shadow-lg backdrop-blur-md">
        Yjs sync
      </div>

      <div className="absolute left-[46%] top-[40%] h-28 w-28 rounded-full border border-accent/25 shadow-[0_0_50px_rgba(139,92,246,0.18)]" />
      <div className="absolute left-[50%] top-[46%] size-4 -translate-x-1/2 rounded-full border border-white/25 bg-accent shadow-[0_0_34px_rgba(139,92,246,0.95)]" />
      <div className="absolute left-[28%] top-[57%] h-px w-[48%] rotate-[-18deg] bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
      <div className="absolute left-[42%] top-[39%] h-px w-[38%] rotate-[24deg] bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent" />
    </div>
  );
}

type HeroVisualProps = {
  /** Shown to assistive tech (replaces raster alt). */
  alt: string;
  className?: string;
};

export function HeroWorkspaceFallback({ alt, className = "" }: HeroVisualProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative aspect-[1200/750] w-full overflow-hidden rounded-2xl bg-[#080c14] ${className}`.trim()}
    >
      <AbstractGlassMesh className="absolute inset-0" />
      <div className="absolute inset-3 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0c111c]/95 shadow-inner sm:inset-4 md:inset-5">
        <div className="flex h-8 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#121a28] px-3 sm:h-9 sm:gap-4 sm:px-4">
          <span className="min-w-0 truncate font-mono text-[10px] text-white/40 sm:text-[11px]">
            room · main.py
          </span>
          <span className="flex shrink-0 items-center gap-2 sm:gap-2.5" aria-hidden>
            <span className="size-2 rounded-full bg-red-500/70 sm:size-2.5" />
            <span className="size-2 rounded-full bg-amber-400/70 sm:size-2.5" />
            <span className="size-2 rounded-full bg-emerald-500/70 sm:size-2.5" />
          </span>
        </div>
        <div className="flex min-h-0 flex-1">
          <div className="hidden w-9 shrink-0 border-r border-white/[0.06] bg-black/35 py-2 pr-1 text-right font-mono text-[9px] leading-[1.35] text-white/20 sm:block sm:w-10 sm:py-2.5 sm:pr-1.5 sm:text-[10px]">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <div className="min-w-0 flex-1 p-3 font-mono text-[10px] leading-relaxed text-emerald-200/85 sm:p-4 sm:text-[11px]">
            <span className="text-violet-300/90">def</span>{" "}
            <span className="text-sky-200/90">run</span>
            <span className="text-white/50">():</span>
            <br />
            <span className="pl-3 text-white/50 sm:pl-4"># Shared with the room</span>
            <br />
            <span className="pl-3 text-sky-200/80 sm:pl-4">print</span>
            <span className="text-white/50">(</span>
            <span className="text-amber-200/80">&quot;stdout → peers&quot;</span>
            <span className="text-white/50">)</span>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-accent/10 via-transparent to-accent-violet/10" />
    </div>
  );
}
