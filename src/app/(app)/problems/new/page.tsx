"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  apiCreateProblem,
  type CreateProblemRequest,
  type Difficulty,
} from "@/lib/problems-api";
import { apiListProgrammingLanguages } from "@/lib/programming-languages-api";
import type { ProgrammingLanguageDto } from "@/lib/programming-languages-api";
import { siteConfig } from "@/lib/site-config";

export default function NewProblemPage() {
  const router = useRouter();
  const [langs, setLangs] = useState<ProgrammingLanguageDto[]>([]);
  const [langId, setLangId] = useState("");
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
  const [solutionCode, setSolutionCode] = useState("");
  const [timeLimitMs, setTimeLimitMs] = useState(2000);
  const [memoryLimitMb, setMemoryLimitMb] = useState(256);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void apiListProgrammingLanguages().then((l) => {
      setLangs(l);
      if (l[0]) setLangId(l[0].id);
    });
  }, []);

  async function submit() {
    setErr(null);
    const lang = langs.find((x) => x.id === langId);
    if (!lang) {
      setErr("Select a solution language.");
      return;
    }
    const body: CreateProblemRequest = {
      title: title.trim(),
      statement: statement.trim(),
      difficulty,
      solutionCode,
      solutionLanguage: { id: lang.id, name: lang.name },
      timeLimitMs,
      memoryLimitMb,
    };
    setPending(true);
    try {
      const { slug } = await apiCreateProblem(body);
      router.push(
        `${siteConfig.routes.problems}/${encodeURIComponent(slug ?? "")}`,
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Create failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground">New problem</h1>
      <p className="mt-2 text-sm text-muted">
        <Link href={siteConfig.routes.problems} className="text-accent hover:underline">
          Back to explore
        </Link>
      </p>
      <div className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="text-muted-strong">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2 outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-strong">Statement</span>
          <textarea
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            rows={6}
            className="mt-1 w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2 outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-strong">Difficulty</span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2"
          >
            {(["EASY", "MEDIUM", "HARD"] as const).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-muted-strong">Solution language</span>
          <select
            value={langId}
            onChange={(e) => setLangId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2"
          >
            {langs.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-muted-strong">Solution code</span>
          <textarea
            value={solutionCode}
            onChange={(e) => setSolutionCode(e.target.value)}
            rows={8}
            className="mt-1 w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2 font-mono text-xs outline-none"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="text-muted-strong">Time limit ms</span>
            <input
              type="number"
              value={timeLimitMs}
              onChange={(e) => setTimeLimitMs(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted-strong">Memory limit MB</span>
            <input
              type="number"
              value={memoryLimitMb}
              onChange={(e) => setMemoryLimitMb(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2"
            />
          </label>
        </div>
        {err ? <p className="text-sm text-rose-200">{err}</p> : null}
        <button
          type="button"
          disabled={pending}
          onClick={() => void submit()}
          className="rounded-lg border border-success/40 bg-success/20 px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create"}
        </button>
      </div>
    </div>
  );
}
