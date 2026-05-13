import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description: string;
  /** Optional illustration or icon above the title. */
  children?: ReactNode;
};

export function EmptyState({
  title,
  description,
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <div
      role="status"
      className={`rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-5 py-6 text-center ${className}`.trim()}
      {...rest}
    >
      {children}
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}
