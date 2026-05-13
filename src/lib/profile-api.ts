import { API_BASE_URL } from "@/lib/api-config";
import { readApiErrorMessage } from "@/lib/api-error";
import {
  getStoredAccessToken,
  throwRedirectingIfUnauthorized,
} from "@/lib/auth-api";

/** Matches backend enums (string values). */
export const EXPERIENCE_LEVELS = [
  "STUDENT",
  "FRESH_GRADUATE",
  "JUNIOR",
  "MID_LEVEL",
  "SENIOR",
] as const;

export const PREFERRED_ROLES = [
  "INTERVIEWER",
  "INTERVIEWEE",
  "BOTH",
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type PreferredRole = (typeof PREFERRED_ROLES)[number];

export type ProfileDto = {
  id: number;
  user_id: string;
  experience_level: ExperienceLevel;
  preferred_role: PreferredRole;
  bio: string | null;
  image_url: string | null;
  created_at: string;
};

export type ProgrammingLanguageDto = {
  id: string;
  name: string;
};

export type UserRatingDto = {
  user_id: string;
  average_rating: number;
  total_reviews: number;
};

export type InterviewHistoryItem = {
  interview_id: number;
  type: string;
  start_time: string | null;
  duration_minutes: number | null;
  role: string;
};

export type FeedbackItem = {
  rating: number;
  comment: string | null;
  reviewer_id: string;
  interview_id: number;
  created_at: string;
};

export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
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

export async function apiGetProfile(): Promise<ProfileDto | null> {
  const res = await fetch(`${apiPrefix()}/api/profile`, {
    credentials: "include",
    headers: authHeaders(),
  });
  throwRedirectingIfUnauthorized(res);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as ProfileDto;
}

export async function apiCreateProfile(body: {
  experience_level: ExperienceLevel;
  preferred_role: PreferredRole;
  bio?: string | null;
  image_url?: string | null;
}): Promise<ProfileDto> {
  const res = await fetch(`${apiPrefix()}/api/profile`, {
    method: "POST",
    credentials: "include",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as ProfileDto;
}

export async function apiUpdateProfile(body: {
  experience_level?: ExperienceLevel | null;
  preferred_role?: PreferredRole | null;
  bio?: string | null;
  image_url?: string | null;
}): Promise<ProfileDto> {
  const res = await fetch(`${apiPrefix()}/api/profile`, {
    method: "PUT",
    credentials: "include",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as ProfileDto;
}

export async function apiDeleteProfile(): Promise<void> {
  const res = await fetch(`${apiPrefix()}/api/profile`, {
    method: "DELETE",
    credentials: "include",
    headers: authHeaders(),
  });
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
}

/** Backend PATCH /api/profile/image expects JSON { photoUrl } (UpdateImageRequest). */
export async function apiPatchProfilePhotoUrl(photoUrl: string): Promise<void> {
  const res = await fetch(`${apiPrefix()}/api/profile/image`, {
    method: "PATCH",
    credentials: "include",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ photoUrl }),
  });
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
}

export async function apiListMyLanguages(): Promise<ProgrammingLanguageDto[]> {
  const res = await fetch(`${apiPrefix()}/api/profile/languages`, {
    credentials: "include",
    headers: authHeaders(),
  });
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as ProgrammingLanguageDto[];
}

export async function apiAddMyLanguage(languageId: string): Promise<void> {
  const res = await fetch(`${apiPrefix()}/api/profile/languages`, {
    method: "POST",
    credentials: "include",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ language_id: languageId }),
  });
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
}

export async function apiRemoveMyLanguage(languageId: string): Promise<void> {
  const res = await fetch(`${apiPrefix()}/api/profile/languages/${languageId}`, {
    method: "DELETE",
    credentials: "include",
    headers: authHeaders(),
  });
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
}

export async function apiListAllLanguages(): Promise<ProgrammingLanguageDto[]> {
  const res = await fetch(`${apiPrefix()}/api/programming-languages`, {
    credentials: "include",
    headers: authHeaders(),
  });
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as ProgrammingLanguageDto[];
}

export async function apiCreateLanguage(name: string): Promise<ProgrammingLanguageDto> {
  const res = await fetch(`${apiPrefix()}/api/programming-languages`, {
    method: "POST",
    credentials: "include",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as ProgrammingLanguageDto;
}

export async function apiGetRating(userId: string): Promise<UserRatingDto> {
  const res = await fetch(`${apiPrefix()}/api/profile/${userId}/rating`, {
    credentials: "include",
    headers: authHeaders(),
  });
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as UserRatingDto;
}

/** Backend query: page, limit (not size). */
export async function apiGetInterviews(
  userId: string,
  params?: { type?: string; status?: string; page?: number; limit?: number },
): Promise<SpringPage<InterviewHistoryItem>> {
  const sp = new URLSearchParams();
  if (params?.type) sp.set("type", params.type);
  if (params?.status) sp.set("status", params.status);
  if (params?.page !== undefined) sp.set("page", String(params.page));
  if (params?.limit !== undefined) sp.set("limit", String(params.limit));
  const q = sp.toString();
  const res = await fetch(
    `${apiPrefix()}/api/profile/${userId}/interviews${q ? `?${q}` : ""}`,
    { credentials: "include", headers: authHeaders() },
  );
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as SpringPage<InterviewHistoryItem>;
}

export async function apiGetFeedbackReceived(
  userId: string,
  params?: { rating?: number; page?: number; limit?: number },
): Promise<SpringPage<FeedbackItem>> {
  const sp = new URLSearchParams();
  if (params?.rating !== undefined) sp.set("rating", String(params.rating));
  if (params?.page !== undefined) sp.set("page", String(params.page));
  if (params?.limit !== undefined) sp.set("limit", String(params.limit));
  const q = sp.toString();
  const res = await fetch(
    `${apiPrefix()}/api/profile/${userId}/feedback${q ? `?${q}` : ""}`,
    { credentials: "include", headers: authHeaders() },
  );
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as SpringPage<FeedbackItem>;
}

export async function apiGetFeedbackGiven(
  userId: string,
  params?: { page?: number; limit?: number },
): Promise<SpringPage<FeedbackItem>> {
  const sp = new URLSearchParams();
  if (params?.page !== undefined) sp.set("page", String(params.page));
  if (params?.limit !== undefined) sp.set("limit", String(params.limit));
  const q = sp.toString();
  const res = await fetch(
    `${apiPrefix()}/api/profile/${userId}/feedback/given${q ? `?${q}` : ""}`,
    { credentials: "include", headers: authHeaders() },
  );
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as SpringPage<FeedbackItem>;
}
