import type { InputHTMLAttributes } from "react";

export function Input({
  id,
  label,
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-white/80">
        {label}
      </label>
      <input
        id={id}
        className={`rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-foreground outline-none transition placeholder:text-muted/70 focus:border-accent/40 focus:ring-2 focus:ring-accent/30 ${className}`}
        {...rest}
      />
    </div>
  );
}
