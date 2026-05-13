import { API_BASE_URL } from "@/lib/api-config";
import { readApiErrorMessage } from "@/lib/api-error";
import { throwRedirectingIfUnauthorized } from "@/lib/auth-api";

export type VideoTransport = "p2p" | "livekit";

/**
 * P2P WebRTC over STOMP vs LiveKit SFU.
 * See `_helper/Documentations/features/sfu_livekit.md`.
 * Set `NEXT_PUBLIC_VIDEO_TRANSPORT=livekit` and `NEXT_PUBLIC_LIVEKIT_URL` for SFU.
 */
export function getVideoTransport(): VideoTransport {
  const raw = (process.env.NEXT_PUBLIC_VIDEO_TRANSPORT ?? "p2p").toLowerCase();
  return raw === "livekit" ? "livekit" : "p2p";
}

/** Browser-visible LiveKit ws(s) URL; empty if unset. */
export function getLiveKitUrl(): string {
  return (process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "").trim();
}

export type LiveKitTokenResponse = {
  token: string;
};

/** Fetches a LiveKit access token for the room (Bearer auth). See `sfu_livekit.md`. */
export async function fetchLiveKitAccessToken(params: {
  roomId: string;
  bearerToken: string;
}): Promise<string> {
  const url = `${API_BASE_URL}/api/rooms/${encodeURIComponent(params.roomId)}/token`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${params.bearerToken}`,
      Accept: "application/json,text/plain;q=0.9,*/*;q=0.8",
    },
    credentials: "include",
  });
  throwRedirectingIfUnauthorized(res);
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = (await res.json()) as LiveKitTokenResponse | { accessToken?: string };
    const token =
      typeof data === "object" && data && "token" in data && typeof data.token === "string"
        ? data.token
        : "accessToken" in data && typeof data.accessToken === "string"
          ? data.accessToken
          : null;
    if (!token) throw new Error("LiveKit token response missing `token` field");
    return token;
  }
  const text = await res.text();
  const token = text.trim();
  if (!token) throw new Error("Empty LiveKit token response");
  return token;
}
