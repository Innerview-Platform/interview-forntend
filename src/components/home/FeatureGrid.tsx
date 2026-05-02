import { Shield, Sparkles, UserRound, Workflow } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="mx-auto mb-12 max-w-2xl text-center text-3xl font-bold tracking-tight sm:text-4xl">
        Built for{" "}
        <span className="text-accent">how you prep today.</span>
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        <GlassCard className="relative overflow-hidden p-6 lg:col-span-2 lg:row-span-2 lg:p-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-accent/20 text-accent">
              <UserRound className="size-5" aria-hidden />
            </span>
            <h3 className="text-lg font-semibold">Developer profile</h3>
          </div>
          <p className="mb-6 text-muted">
            Experience level, preferred interview role, bio, and photo URL line
            up with the InnerView API so recruiters and peers see a consistent
            story.
          </p>
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm leading-relaxed text-muted">
            <p className="font-mono text-xs text-accent/90">GET /api/profile</p>
            <p className="mt-2 text-white/85">
              Same fields you edit in the app — synced from the backend.
            </p>
          </div>
        </GlassCard>
        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent/25 text-accent shadow-[0_0_24px_rgba(192,132,252,0.35)]">
              <Sparkles className="size-6" aria-hidden />
            </span>
            <div>
              <h3 className="text-lg font-semibold">Skills &amp; languages</h3>
              <p className="mt-2 text-sm text-muted">
                Curate languages from the shared catalog, add new tags when
                needed, and keep your stack list aligned with{" "}
                <code className="rounded bg-white/10 px-1 text-xs">
                  /api/profile/languages
                </code>
                .
              </p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <Workflow className="mb-3 size-8 text-accent" aria-hidden />
          <h3 className="text-lg font-semibold">History &amp; feedback</h3>
          <p className="mt-2 text-sm text-muted">
            Interview history and feedback endpoints power your dashboard stats
            and recent reviews as the API evolves.
          </p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="size-8 text-accent" aria-hidden />
          </div>
          <h3 className="text-lg font-semibold">Secure sign-in</h3>
          <p className="mt-2 text-sm text-muted">
            Email and password, Google OAuth, refresh cookies on{" "}
            <code className="rounded bg-white/10 px-1 text-xs">/api/auth</code>
            , and JWT access for protected routes.
          </p>
        </GlassCard>
      </div>
    </section>
  );
}
