/**
 * Optional origin prefix (no trailing slash). Default `""` = same-origin paths * `/api/auth/...` proxied by Next (see `next.config.ts`), so JWT header + cookies work.
 * Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080` only if you call the API directly
 * and expose `Authorization` + align cookie paths on the backend.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
).replace(/\/$/, "");
