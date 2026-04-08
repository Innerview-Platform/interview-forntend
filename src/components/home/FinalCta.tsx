import Link from "next/link";
import { CreditCard, Rocket, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { siteConfig } from "@/lib/site-config";

const perks = [
  { icon: CreditCard, text: "No credit card" },
  { icon: Zap, text: "Free forever plan" },
  { icon: Rocket, text: "Instant access" },
];

export function FinalCta() {
  return (
    <section id="cta" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <GlassCard className="mx-auto max-w-3xl p-8 text-center sm:p-12">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Ready to land your{" "}
          <span className="text-accent">dream engineering role?</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Join thousands of developers practicing daily. Start your first mock
          session in seconds - no credit card required.
        </p>
        <div className="mt-8">
          <Button asChild className="min-w-[220px]">
            <Link href={siteConfig.routes.signup}>Sign up for free</Link>
          </Button>
        </div>
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted sm:text-sm">
          {perks.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2">
              <Icon className="size-4 text-accent" aria-hidden />
              <span className="uppercase tracking-wide">{text}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </section>
  );
}
