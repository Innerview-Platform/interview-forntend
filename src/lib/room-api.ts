import { API_BASE_URL } from "@/lib/api-config";
import { readApiErrorMessage } from "@/lib/api-error";
import { getStoredAccessToken, throwRedirectingIfUnauthorized } from "@/lib/auth-api";

function apiPrefix(): string {
  return API_BASE_URL.replace(/\/$/, "");
}

function authHeaders(): HeadersInit {
  const token = getStoredAccessToken();
  const h: Record<string, string> = {};
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/** Mirrors Spring `ActiveRoomDto` (only fields needed on the client). */
export type ActiveRoomDto = {
  roomId: string;
  uiConfig?: unknown;
  participants?: unknown;
};

/** Built from STOMP `ROLE` / `/roles` / roster signals (not REST join). */
export type RoomParticipantInfo = {
  userId: string;
  /** From `/topic/room/{id}/roles` when owner sends `ROLE_UPDATE`. */
  interviewRole?: string;
};

export function parseRoomParticipants(raw: unknown): RoomParticipantInfo[] {
  if (!raw || typeof raw !== "object") return [];
  const out: RoomParticipantInfo[] = [];
  for (const v of Object.values(raw as Record<string, unknown>)) {
    if (v && typeof v === "object" && v !== null && "userId" in v) {
      const uid = (v as { userId?: unknown }).userId;
      if (typeof uid === "string") out.push({ userId: uid });
    }
  }
  return out;
}

export async function apiLeaveRoom(roomId: string): Promise<void> {
  const res = await fetch(
    `${apiPrefix()}/api/rooms/${encodeURIComponent(roomId)}/leave`,
    {
      method: "POST",
      credentials: "include",
      headers: authHeaders(),
    },
  );
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
}
