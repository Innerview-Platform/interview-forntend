import { API_BASE_URL } from "@/lib/api-config";
import { getStoredAccessToken } from "@/lib/auth-api";

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

/** Mirrors Spring `ActiveRoomDto` (only fields needed on the client). */
export type ActiveRoomDto = {
  roomId: string;
  uiConfig?: unknown;
  participants?: unknown;
};

/** Parsed from `ActiveRoomDto.participants` (Jackson serializes map entries). */
export type RoomParticipantInfo = {
  userId: string;
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

export async function apiJoinRoom(roomId: string): Promise<ActiveRoomDto> {
  const res = await fetch(
    `${apiPrefix()}/api/rooms/${encodeURIComponent(roomId)}/join`,
    {
      method: "POST",
      credentials: "include",
      headers: authHeaders(),
    },
  );
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as ActiveRoomDto;
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
  if (!res.ok) throw new Error(await readErrorMessage(res));
}
