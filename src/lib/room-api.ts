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
