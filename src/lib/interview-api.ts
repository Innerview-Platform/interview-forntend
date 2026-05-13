import { API_BASE_URL } from "@/lib/api-config";
import { readApiErrorMessage } from "@/lib/api-error";
import {
  getStoredAccessToken,
  throwRedirectingIfUnauthorized,
} from "@/lib/auth-api";
import {
  readStoredInterviewIdForRoom,
  writeStoredInterviewIdForRoom,
} from "@/lib/room-interview-session";

export const INTERVIEW_TYPES = [
  "PROBLEM_SOLVING",
  "SYSTEM_DESIGN",
  "HR",
  "TECHNICAL",
] as const;

export const CREATOR_ROLES = ["INTERVIEWER", "INTERVIEWEE", "BOTH"] as const;

export const ROOM_SIZES = ["ONE_ON_ONE", "MANY"] as const;

export type InterviewType = (typeof INTERVIEW_TYPES)[number];
export type CreatorInterviewRole = (typeof CREATOR_ROLES)[number];
export type RoomSize = (typeof ROOM_SIZES)[number];

export type InstantInterviewRequestBody = {
  interviewType: InterviewType;
  roomSize: RoomSize;
  creatorInterviewRole: CreatorInterviewRole;
  /** Ignored by backend today; kept for forward compatibility. */
  durationMinutes?: number;
  /** Problem UUIDs attached to the interview (active problems only). */
  problemIds?: string[];
};

export type ScheduledInterviewRequestBody = Omit<
  InstantInterviewRequestBody,
  "durationMinutes"
> & {
  startTime: string;
};

export type InterviewResponseDto = {
  roomId: string;
  roomLink: string;
  /** Database interview id for submissions. */
  interviewId?: number;
};

export type InterviewByRoomDto = {
  interviewId: number;
  roomId: string;
  status: string;
  type: string;
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

function instantPayload(body: InstantInterviewRequestBody): Record<string, unknown> {
  const out: Record<string, unknown> = {
    interviewType: body.interviewType,
    roomSize: body.roomSize,
    creatorInterviewRole: body.creatorInterviewRole,
  };
  if (body.durationMinutes != null) {
    out.durationMinutes = body.durationMinutes;
  }
  if (body.problemIds?.length) {
    out.problemIds = body.problemIds;
  }
  return out;
}

function persistInterviewIdIfPresent(res: InterviewResponseDto): void {
  if (res.interviewId != null && res.roomId) {
    writeStoredInterviewIdForRoom(res.roomId, Math.floor(res.interviewId));
  }
}

/**
 * If session has no interview id for this room, loads it from the server by room id.
 * No-op on 404.
 */
export async function ensureInterviewIdForRoom(roomId: string): Promise<void> {
  if (typeof window === "undefined") return;
  const id = roomId.trim();
  if (!id) return;
  if (readStoredInterviewIdForRoom(id) != null) return;

  const res = await fetch(
    `${apiPrefix()}/api/interviews/by-room/${encodeURIComponent(id)}`,
    { credentials: "include", headers: authHeaders() },
  );
  if (res.status === 404) return;
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) return;
  const json = (await res.json()) as InterviewByRoomDto;
  persistInterviewIdIfPresent({
    roomId: json.roomId ?? id,
    roomLink: "",
    interviewId: json.interviewId,
  });
}

export async function apiCreateInstantInterview(
  body: InstantInterviewRequestBody,
): Promise<InterviewResponseDto> {
  const res = await fetch(`${apiPrefix()}/api/interviews/instant`, {
    method: "POST",
    credentials: "include",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(instantPayload(body)),
  });
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  const json = (await res.json()) as InterviewResponseDto;
  persistInterviewIdIfPresent(json);
  return json;
}

export async function apiCreateScheduledInterview(
  body: ScheduledInterviewRequestBody,
): Promise<InterviewResponseDto> {
  const { startTime, ...rest } = body;
  const res = await fetch(`${apiPrefix()}/api/interviews/scheduled`, {
    method: "POST",
    credentials: "include",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      ...instantPayload(rest),
      startTime,
    }),
  });
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  const json = (await res.json()) as InterviewResponseDto;
  persistInterviewIdIfPresent(json);
  return json;
}
