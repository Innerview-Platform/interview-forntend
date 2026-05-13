import { API_BASE_URL } from "@/lib/api-config";
import { readApiErrorMessage } from "@/lib/api-error";
import { PISTON_LANGS } from "@/lib/compile-languages";
import {
  getStoredAccessToken,
  throwRedirectingIfUnauthorized,
} from "@/lib/auth-api";

export type ProgrammingLanguageDto = {
  id: string;
  name: string;
};

/**
 * Stable synthetic ids when Postgres has no `programming_language` rows yet.
 * Use for **run** pickers only (`RunCodeRequest.language` is matched by name on the server).
 * Do not use for create/update problem (those need real DB language ids).
 */
export function getFallbackProgrammingLanguageList(): ProgrammingLanguageDto[] {
  return PISTON_LANGS.map((l, idx) => ({
    id: `00000000-0000-4000-8000-${String(idx + 1).padStart(12, "0")}`,
    name: l.id,
  }));
}

function apiPrefix(): string {
  return API_BASE_URL.replace(/\/$/, "");
}

function authHeaders(): HeadersInit {
  const token = getStoredAccessToken();
  const h: Record<string, string> = {};
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function apiListProgrammingLanguages(): Promise<
  ProgrammingLanguageDto[]
> {
  const res = await fetch(`${apiPrefix()}/api/programming-languages`, {
    credentials: "include",
    headers: authHeaders(),
  });
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as ProgrammingLanguageDto[];
}

/**
 * Languages for sample-run / Piston-style pickers. Falls back when the API returns an empty list
 * or a non-OK response (e.g. empty DB seed), so the dropdown is never blank for logged-in users.
 */
export async function apiListProgrammingLanguagesForRun(): Promise<
  ProgrammingLanguageDto[]
> {
  const res = await fetch(`${apiPrefix()}/api/programming-languages`, {
    credentials: "include",
    headers: authHeaders(),
  });
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) return getFallbackProgrammingLanguageList();
  const list = (await res.json()) as ProgrammingLanguageDto[];
  return list.length > 0 ? list : getFallbackProgrammingLanguageList();
}
