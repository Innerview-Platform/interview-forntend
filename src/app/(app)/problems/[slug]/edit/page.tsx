"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  apiCreateTestCase,
  apiDeleteProblem,
  apiDeleteTestCase,
  apiGetProblemBySlug,
  apiListTestCases,
  apiRestoreProblem,
  apiUpdateProblem,
  type Difficulty,
  type ProblemOwnerDto,
  type TestCaseDto,
  type UpdateProblemRequest,
} from "@/lib/problems-api";
import { apiListProgrammingLanguages } from "@/lib/programming-languages-api";
import type { ProgrammingLanguageDto } from "@/lib/programming-languages-api";
import { siteConfig } from "@/lib/site-config";

export default function EditProblemPage() {
  const router = useRouter();
  const params = useParams();
  const slug =
    typeof params.slug === "string"
      ? params.slug
      : Array.isArray(params.slug)
        ? params.slug[0]
        : "";

  const [p, setP] = useState<ProblemOwnerDto | null>(null);
  const [langs, setLangs] = useState<ProgrammingLanguageDto[]>([]);
  const [tests, setTests] = useState<TestCaseDto[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [tcIn, setTcIn] = useState("");
  const [tcOut, setTcOut] = useState("");
  const [tcSample, setTcSample] = useState(true);

  useEffect(() => {
    void apiListProgrammingLanguages().then(setLangs);
  }, []);

  useEffect(() => {
    if (!slug) return;
    void (async () => {
      try {
        const prob = await apiGetProblemBySlug(slug);
        if (!("solutionCode" in prob)) {
          setErr("You can only edit problems you own.");
          return;
        }
        const po = prob as ProblemOwnerDto;
        setP(po);
        const list = await apiListTestCases(po.id);
        setTests(list);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load");
      }
    })();
  }, [slug]);

  async function save() {
    if (!p) return;
    setErr(null);
    try {
      const lang = langs.find((x) => x.id === p.solutionLanguage.id) ?? p.solutionLanguage;
      const body: UpdateProblemRequest = {
        title: p.title,
        statement: p.statement,
        difficulty: p.difficulty as Difficulty,
        solutionCode: p.solutionCode,
        solutionLanguage: { id: lang.id, name: lang.name },
        timeLimitMs: p.timeLimitMs,
        memoryLimitMb: p.memoryLimitMb,
        isActive: p.isActive,
      };
      const next = await apiUpdateProblem(p.id, body);
      setP(next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function addTest() {
    if (!p) return;
    setErr(null);
    try {
      const list = await apiCreateTestCase(p.id, {
        input: tcIn,
        expectedOutput: tcOut,
        isSample: tcSample,
      });
      setTests(list);
      setTcIn("");
      setTcOut("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Test case add failed");
    }
  }

  async function removeTest(id: string) {
    if (!p) return;
    try {
      await apiDeleteTestCase(p.id, id);
      setTests(await apiListTestCases(p.id));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
    }
  }

  if (err && !p) return <p className="p-8 text-rose-200">{err}</p>;
  if (!p) return <p className="p-8 text-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href={`${siteConfig.routes.problems}/${encodeURIComponent(p.slug)}`}
        className="text-sm text-accent hover:underline"
      >
        ← View
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">Edit problem</h1>
      {err ? <p className="mt-2 text-sm text-rose-200">{err}</p> : null}

      <div className="mt-6 space-y-4">
        <label className="block text-sm">
          Title
          <input
            value={p.title}
            onChange={(e) => setP({ ...p, title: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Statement
          <textarea
            value={p.statement}
            onChange={(e) => setP({ ...p, statement: e.target.value })}
            rows={6}
            className="mt-1 w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Difficulty
          <select
            value={p.difficulty}
            onChange={(e) =>
              setP({ ...p, difficulty: e.target.value as Difficulty })
            }
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
          Solution
          <textarea
            value={p.solutionCode}
            onChange={(e) => setP({ ...p, solutionCode: e.target.value })}
            rows={8}
            className="mt-1 w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2 font-mono text-xs"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={p.isActive}
            onChange={(e) => setP({ ...p, isActive: e.target.checked })}
          />
          Active
        </label>
        <button
          type="button"
          onClick={() => void save()}
          className="rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-sm font-semibold"
        >
          Save changes
        </button>
      </div>

      <div className="mt-10 border-t border-white/10 pt-8">
        <h2 className="text-lg font-semibold text-foreground">Test cases</h2>
        <p className="mt-1 text-xs text-muted">
          POST/PUT return the full ordered list (max 100).
        </p>
        <ul className="mt-4 space-y-2">
          {tests.map((t) => (
            <li
              key={t.id ?? `${t.orderIndex}-${t.input}`}
              className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-white/10 bg-black/30 p-3 text-xs"
            >
              <div>
                <pre className="whitespace-pre-wrap text-muted-strong">
                  in: {t.input}
                </pre>
                <pre className="whitespace-pre-wrap text-foreground">
                  out: {t.expectedOutput}
                </pre>
                <p className="mt-1 text-muted">sample: {String(t.isSample)}</p>
              </div>
              {t.id ? (
                <button
                  type="button"
                  onClick={() => void removeTest(t.id!)}
                  className="text-rose-300 hover:underline"
                >
                  Delete
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 rounded-xl border border-white/10 p-4">
          <p className="text-sm font-medium text-foreground">Add test case</p>
          <textarea
            value={tcIn}
            onChange={(e) => setTcIn(e.target.value)}
            placeholder="Input"
            rows={3}
            className="w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2 font-mono text-xs"
          />
          <textarea
            value={tcOut}
            onChange={(e) => setTcOut(e.target.value)}
            placeholder="Expected output"
            rows={3}
            className="w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2 font-mono text-xs"
          />
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={tcSample}
              onChange={(e) => setTcSample(e.target.checked)}
            />
            Sample (visible to non-owners)
          </label>
          <button
            type="button"
            onClick={() => void addTest()}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm"
          >
            Add
          </button>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-white/10 pt-8">
        <button
          type="button"
          onClick={() =>
            void apiDeleteProblem(p.id).then(() =>
              router.push(`${siteConfig.routes.problems}/mine`),
            )
          }
          className="text-sm text-rose-300 hover:underline"
        >
          Soft delete
        </button>
        {!p.isActive ? (
          <button
            type="button"
            onClick={() =>
              void apiRestoreProblem(p.id).then((np) => setP(np))
            }
            className="text-sm text-accent hover:underline"
          >
            Restore
          </button>
        ) : null}
      </div>
    </div>
  );
}
