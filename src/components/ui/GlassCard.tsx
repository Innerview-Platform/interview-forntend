import type { HTMLAttributes } from "react";

export function GlassCard({
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[2.5rem] border border-white/10 bg-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
