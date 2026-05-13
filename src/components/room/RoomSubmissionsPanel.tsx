"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";
import {
  readStoredInterviewIdForRoom,
  writeStoredInterviewIdForRoom,
} from "@/lib/room-interview-session";
import { apiListProgrammingLanguages } from "@/lib/programming-languages-api";
import type { ProgrammingLanguageDto } from "@/lib/programming-languages-api";
import {
  apiSubmitCode,
  pollSubmissionUntilTerminal,
  type SubmissionResultDto,
} from "@/lib/submissions-api";

export function RoomSubmissionsPanel() {
  const params = useParams();
  const roomId =
    typeof params.roomId === "string"
      ? params.roomId
      : Array.isArray(params.roomId)
        ? params.roomId[0]
        : "";

  const { code } = useRoomSession();
  const [sessionInput, setSessionInput] = useState("");
  const [problemId, setProblemId] = useState(() => {
    const v = process.env.NEXT_PUBLIC_SEED_PROBLEM_UUID?.trim();
    return v && v.length > 0 ? v : "";
  });
  const [language, setLanguage] = useState("");
  const [langs, setLangs] = useState<ProgrammingLanguageDto[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<SubmissionResultDto | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const stored = readStoredInterviewIdForRoom(roomId);
    setSessionInput(stored != null ? String(stored) : "");
  }, [roomId]);

  useEffect(() => {
    void apiListProgrammingLanguages()
      .then((list) => {
        setLangs(list);
        setLanguage((prev) => prev || list[0]?.name || "");
      })
      .catch(() => setLangs([]));
  }, []);

  const persistSession = useCallback(() => {
    const n = Number(sessionInput.trim());
    if (!roomId || !Number.isFinite(n) || n <= 0) return;
    writeStoredInterviewIdForRoom(roomId, Math.floor(n));
  }, [roomId, sessionInput]);

  async function handleSubmit() {
    setErr(null);
    setResult(null);
    const sid = Number(sessionInput.trim());
    if (!Number.isFinite(sid) || sid <= 0) {
      setErr("Enter the interview session id (database Long from the backend), not the room code string.");
      return;
    }
    const pid = problemId.trim();
    if (!pid) {
      setErr("Problem id (UUID) is required.");
      return;
    }
    if (!language.trim()) {
      setErr("Pick a language from the catalog.");
      return;
    }
    persistSession();
    setBusy(true);
    try {
      const { submissionId } = await apiSubmitCode(sid, {
        code,
        language: language.trim(),
        problemId: pid,
      });
      const final = await pollSubmissionUntilTerminal(submissionId, {
        onTick: (r) => setResult(r),
      });
      setResult(final);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 text-sm">
      <p className="text-muted">
        Submit the shared editor for judging against this problem. Enter the interview
        session id and problem id once per tab; they are saved for this room in your
        browser.
      </p>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-strong">
          Interview session id (Long)
        </span>
        <input
          value={sessionInput}
          onChange={(e) => setSessionInput(e.target.value)}
          onBlur={persistSession}
          className="w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-accent/50"
          placeholder="e.g. 42"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-strong">
          Problem id (UUID)
        </span>
        <input
          value={problemId}
          onChange={(e) => setProblemId(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-accent/50"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-strong">
          Language (catalog name)
        </span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-surface-soft/80 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
        >
          {langs.map((l) => (
            <option key={l.id} value={l.name}>
              {l.name}
            </option>
          ))}
        </select>
      </label>

      <p className="text-xs text-muted">
        Code is taken from the live shared editor in this room (same buffer as the Editor tab).
      </p>

      <button
        type="button"
        disabled={busy}
        onClick={() => void handleSubmit()}
        className="rounded-lg border border-accent/40 bg-accent/20 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent/30 disabled:opacity-50"
      >
        {busy ? "Submitting…" : "Submit for judging"}
      </button>

      {err ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-rose-100">
          {err}
        </p>
      ) : null}

      {result ? (
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="mb-2 font-semibold text-foreground">Verdict: {result.status}</p>
          {result.score != null ? (
            <p className="text-muted">Score: {result.score}</p>
          ) : null}
          {result.testResults?.length ? (
            <ul className="mt-2 space-y-1 font-mono text-xs text-muted-strong">
              {result.testResults.map((t) => (
                <li key={t.testIndex}>
                  Test #{t.testIndex}: {t.status}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
