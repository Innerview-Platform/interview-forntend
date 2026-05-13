import { API_BASE_URL } from "@/lib/api-config";
import { readApiErrorMessage } from "@/lib/api-error";
import {
  getStoredAccessToken,
  throwRedirectingIfUnauthorized,
} from "@/lib/auth-api";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type ProgrammingLanguageRef = {
  id: string;
  name: string;
};

export type ProblemCreatorDto = {
  id: string;
  name: string;
};

export type ProblemResponseDto = {
  id: string;
  title: string;
  slug: string;
  statement: string;
  difficulty: Difficulty;
  tags: string[];
  timeLimitMs: number;
  memoryLimitMb: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: ProblemCreatorDto;
};

export type ProblemOwnerDto = ProblemResponseDto & {
  solutionCode: string;
  solutionLanguage: ProgrammingLanguageRef;
};

export type TestCaseDto = {
  id?: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
  weight?: number;
  orderIndex?: number;
  description?: string;
};

export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
};

export type ProblemListParams = {
  page?: number;
  size?: number;
  search?: string;
  difficulty?: Difficulty;
  tag?: string;
  createdBy?: string;
  isActive?: boolean;
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

function buildProblemQuery(params?: ProblemListParams): string {
  const sp = new URLSearchParams();
  if (params?.page !== undefined) sp.set("page", String(params.page));
  if (params?.size !== undefined) sp.set("size", String(params.size));
  if (params?.search) sp.set("search", params.search);
  if (params?.difficulty) sp.set("difficulty", params.difficulty);
  if (params?.tag) sp.set("tag", params.tag);
  if (params?.createdBy) sp.set("createdBy", params.createdBy);
  if (params?.isActive !== undefined) {
    sp.set("isActive", String(params.isActive));
  }
  const q = sp.toString();
  return q ? `?${q}` : "";
}

/** Public list (`permitAll` on BE for this path). */
export async function apiListProblems(
  params?: ProblemListParams,
): Promise<SpringPage<ProblemResponseDto>> {
  const res = await fetch(
    `${apiPrefix()}/api/problems${buildProblemQuery(params)}`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as SpringPage<ProblemResponseDto>;
}

export async function apiListMyProblems(
  params?: ProblemListParams,
): Promise<SpringPage<ProblemOwnerDto>> {
  const res = await fetch(
    `${apiPrefix()}/api/problems/mine${buildProblemQuery(params)}`,
    { credentials: "include", headers: authHeaders() },
  );
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as SpringPage<ProblemOwnerDto>;
}

export async function apiGetProblemBySlug(
  slug: string,
): Promise<ProblemResponseDto | ProblemOwnerDto> {
  const res = await fetch(
    `${apiPrefix()}/api/problems/${encodeURIComponent(slug)}`,
    { credentials: "include", headers: authHeaders() },
  );
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as ProblemOwnerDto;
}

export type CreateProblemRequest = {
  title: string;
  statement: string;
  difficulty: Difficulty;
  tags?: string[];
  explanation?: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  solutionCode: string;
  solutionLanguage: ProgrammingLanguageRef;
};

export type UpdateProblemRequest = CreateProblemRequest & {
  isActive?: boolean;
};

export async function apiCreateProblem(
  body: CreateProblemRequest,
): Promise<{ problem: ProblemOwnerDto; slug: string | null }> {
  const res = await fetch(`${apiPrefix()}/api/problems`, {
    method: "POST",
    credentials: "include",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  const loc = res.headers.get("Location");
  let slug: string | null = null;
  if (loc) {
    const m = /\/api\/problems\/([^/]+)\s*$/.exec(loc);
    slug = m ? decodeURIComponent(m[1]) : null;
  }
  const problem = (await res.json()) as ProblemOwnerDto;
  return { problem, slug: slug ?? problem.slug ?? null };
}

export async function apiUpdateProblem(
  id: string,
  body: UpdateProblemRequest,
): Promise<ProblemOwnerDto> {
  const res = await fetch(
    `${apiPrefix()}/api/problems/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      credentials: "include",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as ProblemOwnerDto;
}

export async function apiDeleteProblem(id: string): Promise<void> {
  const res = await fetch(
    `${apiPrefix()}/api/problems/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: authHeaders(),
    },
  );
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
}

export async function apiRestoreProblem(id: string): Promise<ProblemOwnerDto> {
  const res = await fetch(
    `${apiPrefix()}/api/problems/${encodeURIComponent(id)}/restore`,
    {
      method: "PATCH",
      credentials: "include",
      headers: authHeaders(),
    },
  );
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as ProblemOwnerDto;
}

export async function apiListTestCases(
  problemId: string,
): Promise<TestCaseDto[]> {
  const res = await fetch(
    `${apiPrefix()}/api/problems/${encodeURIComponent(problemId)}/test-cases`,
    { credentials: "include", headers: authHeaders() },
  );
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as TestCaseDto[];
}

export async function apiCreateTestCase(
  problemId: string,
  body: TestCaseDto,
): Promise<TestCaseDto[]> {
  const res = await fetch(
    `${apiPrefix()}/api/problems/${encodeURIComponent(problemId)}/test-cases`,
    {
      method: "POST",
      credentials: "include",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as TestCaseDto[];
}

export async function apiUpdateTestCase(
  problemId: string,
  testCaseId: string,
  body: TestCaseDto,
): Promise<TestCaseDto[]> {
  const res = await fetch(
    `${apiPrefix()}/api/problems/${encodeURIComponent(problemId)}/test-cases/${encodeURIComponent(testCaseId)}`,
    {
      method: "PUT",
      credentials: "include",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as TestCaseDto[];
}

export async function apiDeleteTestCase(
  problemId: string,
  testCaseId: string,
): Promise<void> {
  const res = await fetch(
    `${apiPrefix()}/api/problems/${encodeURIComponent(problemId)}/test-cases/${encodeURIComponent(testCaseId)}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: authHeaders(),
    },
  );
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
}

export type RunCodeRequest = {
  code: string;
  language: string;
};

export async function apiRunProblemSamples(
  problemId: string,
  body: RunCodeRequest,
): Promise<unknown> {
  const res = await fetch(
    `${apiPrefix()}/api/problems/${encodeURIComponent(problemId)}/run`,
    {
      method: "POST",
      credentials: "include",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return res.json();
}
