export function PageBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#060912_0%,#0b1220_42%,#111827_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(124,58,237,0.12),transparent_34%,rgba(192,132,252,0.12)_72%,transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(148,163,184,0.08),transparent_42%)]" />
    </div>
  );
}
