import { API_BASE_URL } from "@/lib/api-config";
import { readApiErrorMessage } from "@/lib/api-error";
import {
  getStoredAccessToken,
  throwRedirectingIfUnauthorized,
} from "@/lib/auth-api";

export type ProgrammingLanguageDto = {
  id: string;
  name: string;
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
