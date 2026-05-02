"use client";

import { Clock } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

export function AvailabilityCard() {
  return (
    <GlassCard className="p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent">
          <Clock className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">Availability</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Let others know when you&apos;re typically free for mock sessions. Calendar
            sync is not wired up yet.
          </p>
          <Button type="button" variant="ghost" className="mt-4" disabled>
            Set availability (soon)
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
