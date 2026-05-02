/**
 * Optional origin prefix (no trailing slash). Default `""` = same-origin paths
 * (`/api/auth/...`, `/api/rooms/...`, etc. proxied by Next — see `next.config.ts`).
 * Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080` only if you call the API directly
 * and expose `Authorization` + align cookie paths on the backend.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
).replace(/\/$/, "");

/**
 * SockJS + STOMP must connect to the real Spring host (Next rewrites do not upgrade WebSockets).
 * Prefer `NEXT_PUBLIC_WS_ORIGIN`; fallback to `NEXT_PUBLIC_API_BASE_URL`; then `http://localhost:8080`.
 */
export function getWsOrigin(): string {
  const fromEnv =
    (process.env.NEXT_PUBLIC_WS_ORIGIN?.trim() ||
      process.env.NEXT_PUBLIC_API_BASE_URL?.trim()) ??
    "";
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "http://localhost:8080";
}
