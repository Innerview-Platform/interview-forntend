import type { InputHTMLAttributes } from "react";

export function Input({
  id,
  label,
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-muted-strong">
        {label}
      </label>
      <input
        id={id}
        className={`rounded-lg border border-white/15 bg-surface-soft/75 px-4 py-3 text-foreground outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition placeholder:text-muted/70 focus:border-accent/50 focus:ring-2 focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...rest}
      />
    </div>
  );
}
