"use client";

import type { ProgrammingLanguageDto } from "@/lib/profile-api";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

/** Native selects: solid fill + light text + dark color-scheme for readable option lists (esp. Windows). */
const PROFILE_SELECT_BASE =
  "min-w-0 rounded-xl border border-white/25 bg-[#1a142e] px-3 py-2.5 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] outline-none [color-scheme:dark] transition focus-visible:border-violet-400/70 focus-visible:ring-2 focus-visible:ring-violet-500/40 disabled:opacity-50";

const PROFILE_SELECT_WIDE_CLASS = `min-w-[12rem] ${PROFILE_SELECT_BASE}`;

const PROFILE_OPTION_CLASS = "bg-[#1a142e] text-white";

type Props = {
  myLangs: ProgrammingLanguageDto[];
  catalogFiltered: ProgrammingLanguageDto[];
  selectedLangId: string;
  onSelectLangId: (id: string) => void;
  onAddLanguage: () => void;
  newLangName: string;
  onNewLangName: (v: string) => void;
  onCreateLanguage: () => void;
  langBusy: boolean;
  onRemoveLanguage: (id: string) => void;
};

export function SkillsSection({
  myLangs,
  catalogFiltered,
  selectedLangId,
  onSelectLangId,
  onAddLanguage,
  newLangName,
  onNewLangName,
  onCreateLanguage,
  langBusy,
  onRemoveLanguage,
}: Props) {
  return (
    <GlassCard className="p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-foreground">Skills & languages</h2>
      <p className="mt-1 text-sm text-muted">
        Tag the stacks you want to practice-tighter lists read faster in the dashboard.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {myLangs.length === 0 ? (
          <EmptyState
            className="w-full"
            title="No languages selected"
            description="Add the languages you want to practice so interview partners can scan your stack quickly."
          />
        ) : (
          myLangs.map((l) => (
            <Badge
              key={l.id}
              tone="accent"
              className="pr-1"
            >
              {l.name}
              <button
                type="button"
                className="ml-0.5 rounded-full px-1 text-violet-100/80 hover:bg-white/10 hover:text-white"
                disabled={langBusy}
                onClick={() => onRemoveLanguage(l.id)}
                aria-label={`Remove ${l.name}`}
              >
                ×
              </button>
            </Badge>
          ))
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Add language</span>
          <select
            value={selectedLangId}
            onChange={(e) => onSelectLangId(e.target.value)}
            className={PROFILE_SELECT_WIDE_CLASS}
          >
            <option value="" className={PROFILE_OPTION_CLASS}>
              Select…
            </option>
            {catalogFiltered.map((l) => (
              <option key={l.id} value={l.id} className={PROFILE_OPTION_CLASS}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="button"
          variant="ghost"
          disabled={langBusy || !selectedLangId}
          onClick={onAddLanguage}
        >
          Add
        </Button>
      </div>
      <div className="mt-6 border-t border-white/10 pt-6">
        <p className="text-sm text-muted">Missing a language? Create it.</p>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <input
            value={newLangName}
            onChange={(e) => onNewLangName(e.target.value)}
            placeholder="e.g. Dart"
            className="rounded-lg border border-white/15 bg-surface-soft/75 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/25"
          />
          <Button
            type="button"
            variant="outline"
            disabled={langBusy || !newLangName.trim()}
            onClick={onCreateLanguage}
          >
            Create language
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
