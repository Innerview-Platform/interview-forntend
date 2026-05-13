import type { HTMLAttributes, ReactNode } from "react";

type Tone = "success" | "info" | "neutral" | "accent" | "warning";

const tones: Record<Tone, string> = {
  success:
    "border border-success/35 bg-success/12 text-success shadow-[0_0_20px_rgba(34,197,94,0.12)]",
  info: "border border-accent/35 bg-accent/12 text-accent-soft shadow-[0_0_24px_rgba(139,92,246,0.15)]",
  neutral:
    "border border-white/15 bg-white/[0.06] text-muted-strong shadow-[0_0_16px_rgba(255,255,255,0.04)]",
  accent:
    "border border-accent/40 bg-accent/18 text-white shadow-[0_0_20px_rgba(139,92,246,0.2)]",
  warning:
    "border border-warning/40 bg-warning/12 text-warning shadow-[0_0_20px_rgba(245,158,11,0.12)]",
};

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  children: ReactNode;
};

export function Badge({
  tone = "neutral",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide sm:text-[11px] ${tones[tone]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </span>
  );
}
