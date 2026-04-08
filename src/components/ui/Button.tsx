import {
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
} from "react";

type Variant = "primary" | "ghost" | "outline";

const variants: Record<Variant, string> = {
  primary:
    "rounded-xl bg-gradient-to-r from-violet-600 via-accent-violet to-accent-strong px-5 py-3 font-semibold text-white shadow-lg transition hover:shadow-[0_0_24px_rgba(192,132,252,0.45)] disabled:cursor-not-allowed disabled:opacity-50",
  ghost:
    "rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-medium text-foreground backdrop-blur transition hover:border-white/25 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50",
  outline:
    "rounded-xl border border-white/20 bg-transparent px-5 py-3 font-medium text-foreground transition hover:border-accent/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  asChild?: boolean;
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  asChild,
  children,
  ...rest
}: Props) {
  const classes = `inline-flex items-center justify-center gap-2 ${variants[variant]} ${className}`;

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, {
      className: [classes, child.props.className].filter(Boolean).join(" "),
    });
  }

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
