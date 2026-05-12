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
      <div className="absolute inset-2 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0c111c]/95 shadow-inner sm:inset-3">
        <div className="flex h-7 shrink-0 items-center gap-1.5 border-b border-white/10 bg-[#121a28] px-2 sm:h-8 sm:px-3">
          <span className="size-2 rounded-full bg-red-500/70 sm:size-2.5" />
          <span className="size-2 rounded-full bg-amber-400/70 sm:size-2.5" />
          <span className="size-2 rounded-full bg-emerald-500/70 sm:size-2.5" />
          <span className="ml-2 font-mono text-[9px] text-white/35 sm:text-[10px]">
            room · main.py
          </span>
        </div>
        <div className="flex min-h-0 flex-1">
          <div className="hidden w-9 shrink-0 border-r border-white/[0.06] bg-black/35 pt-2 text-right font-mono text-[9px] leading-[1.35] text-white/20 sm:block sm:w-10 sm:text-[10px]">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <div className="min-w-0 flex-1 p-2 font-mono text-[10px] leading-relaxed text-emerald-200/85 sm:p-3 sm:text-[11px]">
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
