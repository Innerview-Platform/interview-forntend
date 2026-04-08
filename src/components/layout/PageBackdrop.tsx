export function PageBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0815] via-[#120c22] to-[#1a142e]" />
      <div className="absolute -left-32 top-1/4 h-[480px] w-[480px] rounded-full bg-accent-strong/25 blur-[100px]" />
      <div className="absolute -right-24 top-1/3 h-[420px] w-[420px] rounded-full bg-accent-violet/20 blur-[90px]" />
      <div className="absolute bottom-0 left-1/2 h-[360px] w-[600px] -translate-x-1/2 rounded-full bg-accent/15 blur-[100px]" />
    </div>
  );
}
