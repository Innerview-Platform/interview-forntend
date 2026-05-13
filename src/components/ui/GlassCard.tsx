import type { HTMLAttributes } from "react";

export function GlassCard({
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-glass-border bg-glass-bg shadow-[0_18px_48px_rgba(0,0,0,0.28)] backdrop-blur-xl ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
