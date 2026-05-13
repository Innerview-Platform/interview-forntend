type Props = {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  className = "",
}: Props) {
  return (
    <header className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-soft">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
    </header>
  );
}
