import { API_BASE_URL } from "@/lib/api-config";
import { readApiErrorMessage } from "@/lib/api-error";
import {
  getStoredAccessToken,
  throwRedirectingIfUnauthorized,
} from "@/lib/auth-api";

export type SubmissionStatus =
  | "PENDING"
  | "RUNNING"
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "MEMORY_LIMIT_EXCEEDED"
  | "COMPILE_ERROR"
  | "RUNTIME_ERROR"
  | "SKIPPED";

export type SubmissionTestCaseResultDto = {
  testIndex: number;
  status: SubmissionStatus;
  durationMs?: number;
};

export type SubmissionResultDto = {
  submissionId: string | null;
  sessionId: number | null;
  problemId: string;
  status: SubmissionStatus;
  score: number | null;
  totalDurationMs: number | null;
  testResults: SubmissionTestCaseResultDto[];
};

export type SubmitCodeRequest = {
  code: string;
  language: string;
  problemId: string;
};

function apiPrefix(): string {
  return API_BASE_URL.replace(/\/$/, "");
}

function authHeaders(): HeadersInit {
  const token = getStoredAccessToken();
  const h: Record<string, string> = {};
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function apiSubmitCode(
  interviewSessionId: number,
  body: SubmitCodeRequest,
): Promise<{ submissionId: string }> {
  const res = await fetch(
    `${apiPrefix()}/api/sessions/${encodeURIComponent(String(interviewSessionId))}/submissions`,
    {
      method: "POST",
      credentials: "include",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  throwRedirectingIfUnauthorized(res);
  if (res.status === 202) {
    const data = (await res.json()) as { submissionId?: string };
    if (!data.submissionId) {
      throw new Error("Submission accepted but response missing submissionId");
    }
    return { submissionId: data.submissionId };
  }
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  throw new Error(`Expected 202 from submit, got ${res.status}`);
}

export async function apiGetSubmission(
  submissionId: string,
): Promise<SubmissionResultDto> {
  const res = await fetch(
    `${apiPrefix()}/api/submissions/${encodeURIComponent(submissionId)}`,
    { credentials: "include", headers: authHeaders() },
  );
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as SubmissionResultDto;
}

const TERMINAL: SubmissionStatus[] = [
  "ACCEPTED",
  "WRONG_ANSWER",
  "TIME_LIMIT_EXCEEDED",
  "MEMORY_LIMIT_EXCEEDED",
  "COMPILE_ERROR",
  "RUNTIME_ERROR",
  "SKIPPED",
];

export function isSubmissionTerminal(status: SubmissionStatus): boolean {
  return TERMINAL.includes(status);
}

export async function pollSubmissionUntilTerminal(
  submissionId: string,
  opts?: { maxMs?: number; onTick?: (r: SubmissionResultDto) => void },
): Promise<SubmissionResultDto> {
  const maxMs = opts?.maxMs ?? 120_000;
  const start = Date.now();
  let delay = 400;
  for (;;) {
    const r = await apiGetSubmission(submissionId);
    opts?.onTick?.(r);
    if (isSubmissionTerminal(r.status)) return r;
    if (Date.now() - start > maxMs) {
      throw new Error("Submission polling timed out");
    }
    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(delay * 1.35, 5000);
  }
}
