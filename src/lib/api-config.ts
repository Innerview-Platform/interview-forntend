/**
 * API origin (no trailing slash).
 * Default `/api-backend` uses Next.js rewrites → BACKEND_ORIGIN (see next.config.ts).
 * Set NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 only if you expose `Authorization`
 * via Access-Control-Expose-Headers on the backend.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api-backend"
).replace(/\/$/, "");
