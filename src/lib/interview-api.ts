import { API_BASE_URL } from "@/lib/api-config";
import { getStoredAccessToken } from "@/lib/auth-api";

export const INTERVIEW_TYPES = [
  "PROBLEM_SOLVING",
  "SYSTEM_DESIGN",
  "HR",
  "TECHNICAL",
] as const;

export const CREATOR_ROLES = ["INTERVIEWER", "INTERVIEWEE", "BOTH"] as const;

export type InterviewType = (typeof INTERVIEW_TYPES)[number];
export type CreatorInterviewRole = (typeof CREATOR_ROLES)[number];

export type InstantInterviewRequestBody = {
  interviewType: InterviewType;
  creatorInterviewRole: CreatorInterviewRole;
  durationMinutes?: number;
};

export type InterviewResponseDto = {
  roomId: string;
  roomLink: string;
};

function apiPrefix(): string {
  return API_BASE_URL.replace(/\/$/, "");
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      const data: unknown = await res.json();
      if (
        data &&
        typeof data === "object" &&
        "error" in data &&
        typeof (data as { error: unknown }).error === "string"
      ) {
        return (data as { error: string }).error;
      }
    } else {
      const text = await res.text();
      if (text) return text.slice(0, 200);
    }
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status})`;
}

function authHeaders(): HeadersInit {
  const token = getStoredAccessToken();
  const h: Record<string, string> = {};
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function apiCreateInstantInterview(
  body: InstantInterviewRequestBody,
): Promise<InterviewResponseDto> {
  const res = await fetch(`${apiPrefix()}/api/interviews/instant`, {
    method: "POST",
    credentials: "include",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as InterviewResponseDto;
}
