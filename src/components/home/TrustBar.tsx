const brands = ["VERTEX", "SHELL.CO", "LUMINA", "QUBIT", "NEXUS"];

export function TrustBar() {
  return (
    <section className="border-y border-white/5 bg-black/20 py-8 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Trusted by developers from leading engineering teams
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
          {brands.map((name) => (
            <span
              key={name}
              className="text-sm font-semibold tracking-widest text-white/50"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
