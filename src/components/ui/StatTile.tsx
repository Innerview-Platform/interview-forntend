type Props = {
  label: string;
  value: string;
  hint?: string;
};

export function StatTile({ label, value, hint }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 shadow-[0_12px_32px_rgba(0,0,0,0.2)] backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs leading-relaxed text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
