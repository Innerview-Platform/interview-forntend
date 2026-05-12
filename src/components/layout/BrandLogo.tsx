import { Sparkles } from "lucide-react";

type Props = {
  /** Tighter layout for app chrome (e.g. top bar). */
  compact?: boolean;
};

export function BrandLogo({ compact = false }: Props) {
  return (
    <span
      className={`inline-flex items-center ${compact ? "gap-2" : "gap-2.5"}`}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-xl border border-white/12 bg-gradient-to-br from-accent/30 to-accent-violet/20 text-white shadow-[0_8px_24px_rgba(99,102,241,0.28)] ${compact ? "size-8" : "size-9"}`}
      >
        <Sparkles className={compact ? "size-3.5" : "size-4"} aria-hidden />
      </span>
      <span
        className={`bg-gradient-to-r from-foreground via-white to-muted-strong bg-clip-text text-transparent ${compact ? "text-sm sm:text-base" : ""}`}
      >
        InnerView
      </span>
    </span>
  );
}
