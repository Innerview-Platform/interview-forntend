import { GitBranch, Sparkles, Workflow } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="mx-auto mb-12 max-w-2xl text-center text-3xl font-bold tracking-tight sm:text-4xl">
        Precision practice for{" "}
        <span className="text-accent">precision interviews.</span>
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        <GlassCard className="relative overflow-hidden p-6 lg:col-span-2 lg:row-span-2 lg:p-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-accent/20 text-accent">
              <GitBranch className="size-5" aria-hidden />
            </span>
            <h3 className="text-lg font-semibold">Live code sessions</h3>
          </div>
          <p className="mb-6 text-muted">
            Pair with a mentor or bot in a shared IDE with syntax highlight and
            run history.
          </p>
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-relaxed text-muted sm:text-sm">
            <span className="text-accent">{`// AI Copilot`}</span>
            {"\n"}
            <span className="text-white/90">function optimizeRoute(graph) {"{"}</span>
            {"\n"}
            {"  "}
            <span className="text-white/70">
              {`// Consider memoizing visited nodes for O(V+E)`}
            </span>
            {"\n"}
            {"}"}
          </div>
        </GlassCard>
        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent/25 text-accent shadow-[0_0_24px_rgba(192,132,252,0.35)]">
              <Sparkles className="size-6" aria-hidden />
            </span>
            <div>
              <h3 className="text-lg font-semibold">AI copilot</h3>
              <p className="mt-2 text-sm text-muted">
                Real-time hints on complexity, edge cases, and communication -
                without spoiling the answer.
              </p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <Workflow className="mb-3 size-8 text-accent" aria-hidden />
          <h3 className="text-lg font-semibold">System design</h3>
          <p className="mt-2 text-sm text-muted">
            Infinite canvas for components, data flows, and tradeoffs.
          </p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="size-8 rounded-full border-2 border-[#0b0815] bg-gradient-to-br from-accent/80 to-accent-violet"
                />
              ))}
            </div>
            <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs font-medium text-accent">
              +5k
            </span>
          </div>
          <h3 className="text-lg font-semibold">Peer network</h3>
          <p className="mt-2 text-sm text-muted">
            Match with interviewers and peers worldwide. +5k sessions weekly.
          </p>
        </GlassCard>
      </div>
    </section>
  );
}
