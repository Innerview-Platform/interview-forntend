"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  apiGetProblemBySlug,
  apiRunProblemSamples,
  type ProblemOwnerDto,
  type ProblemResponseDto,
} from "@/lib/problems-api";
import { apiListProgrammingLanguagesForRun } from "@/lib/programming-languages-api";
import type { ProgrammingLanguageDto } from "@/lib/programming-languages-api";
import { siteConfig } from "@/lib/site-config";

export default function ProblemDetailPage() {
  const params = useParams();
  const slug =
    typeof params.slug === "string"
      ? params.slug
      : Array.isArray(params.slug)
        ? params.slug[0]
        : "";

  const [p, setP] = useState<ProblemResponseDto | ProblemOwnerDto | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [runLang, setRunLang] = useState("");
  const [runCode, setRunCode] = useState("");
  const [runOut, setRunOut] = useState<string | null>(null);
  const [runLangs, setRunLangs] = useState<ProgrammingLanguageDto[]>([]);

  useEffect(() => {
    if (!slug) return;
    void apiGetProblemBySlug(slug).then(setP).catch((e) => {
      setErr(e instanceof Error ? e.message : "Load failed");
    });
  }, [slug]);

  useEffect(() => {
    void apiListProgrammingLanguagesForRun().then((l) => {
      setRunLangs(l);
      setRunLang((prev) => prev || l[0]?.name || "");
    });
  }, []);

  const owner = p && "solutionCode" in p;

  async function runSamples() {
    if (!p || !runLang.trim()) return;
    setRunOut(null);
    try {
      const code = owner
        ? (p as ProblemOwnerDto).solutionCode
        : runCode;
      const res = await apiRunProblemSamples(p.id, {
        code,
        language: runLang.trim(),
      });
      setRunOut(JSON.stringify(res, null, 2));
    } catch (e) {
      setRunOut(e instanceof Error ? e.message : "Run failed");
    }
  }

  if (err) return <p className="p-8 text-rose-200">{err}</p>;
  if (!p) return <p className="p-8 text-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <Link href={siteConfig.routes.problems} className="text-accent hover:underline">
          Explore
        </Link>
        {owner ? (
          <Link
            href={`${siteConfig.routes.problems}/${encodeURIComponent(p.slug)}/edit`}
            className="text-accent hover:underline"
          >
            Edit
          </Link>
        ) : null}
      </div>
      <h1 className="text-2xl font-semibold text-foreground">{p.title}</h1>
      <p className="mt-2 text-sm text-muted">{p.difficulty}</p>
      <pre className="mt-6 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-foreground">
        {p.statement}
      </pre>

      <div className="mt-8 border-t border-white/10 pt-6">
        <h2 className="text-lg font-medium text-foreground">Run (samples)</h2>
        <p className="mt-1 text-xs text-muted">
          Run sample tests in your chosen language. Guests only see sample cases.
        </p>
        <select
          value={runLang}
          onChange={(e) => setRunLang(e.target.value)}
          className="mt-3 rounded-lg border border-white/15 bg-surface-soft px-3 py-2 text-sm"
        >
          {runLangs.map((l) => (
            <option key={l.id} value={l.name}>
              {l.name}
            </option>
          ))}
        </select>
        {!owner ? (
          <textarea
            value={runCode}
            onChange={(e) => setRunCode(e.target.value)}
            rows={6}
            placeholder="Your code for sample tests"
            className="mt-3 w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2 font-mono text-xs outline-none"
          />
        ) : null}
        <button
          type="button"
          onClick={() => void runSamples()}
          className="ml-3 rounded-lg border border-white/20 px-3 py-2 text-sm"
        >
          Run
        </button>
        {runOut ? (
          <pre className="mt-4 max-h-64 overflow-auto rounded-lg bg-black/40 p-3 text-xs text-muted-strong">
            {runOut}
          </pre>
        ) : null}
      </div>
    </div>
  );
}
