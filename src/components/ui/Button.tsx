import {
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
} from "react";

type Variant = "primary" | "ghost" | "outline";

const variants: Record<Variant, string> = {
  primary:
    "rounded-lg border border-accent/35 bg-accent px-5 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(79,70,229,0.24)] transition hover:bg-accent-strong hover:shadow-[0_16px_36px_rgba(79,70,229,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  ghost:
    "rounded-lg border border-white/10 bg-white/[0.04] px-5 py-3 font-medium text-foreground backdrop-blur transition hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  outline:
    "rounded-lg border border-white/15 bg-transparent px-5 py-3 font-medium text-foreground transition hover:border-accent/45 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
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
