import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "default" | "success" | "warning";

const tones: Record<Tone, string> = {
  default:
    "border-white/15 bg-white/[0.06] text-foreground hover:bg-white/[0.1]",
  success:
    "border-success/40 bg-success/15 text-emerald-100 hover:bg-success/25",
  warning:
    "border-warning/45 bg-warning/15 text-amber-100 hover:bg-warning/22",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: Tone;
  children: ReactNode;
};

export function ToolbarButton({
  tone = "default",
  className = "",
  children,
  type = "button",
  ...rest
}: Props) {
  const base =
    "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080c14] disabled:pointer-events-none disabled:opacity-45";
  return (
    <button
      type={type}
      className={`${base} ${tones[tone]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
