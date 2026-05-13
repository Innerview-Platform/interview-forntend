/** Clock skew so we refresh slightly before the server rejects the JWT. */
const DEFAULT_SKEW_SEC = 60;

/**
 * Returns JWT `exp` (seconds since UTC epoch) from an HS/RS JWT shape, or null if missing/invalid.
 * Does not verify the signature (browser cannot); used only for UX pre-redirect.
 */
export function getJwtExpiryUtcSeconds(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const json = atob(padded);
    const data = JSON.parse(json) as { exp?: unknown };
    return typeof data.exp === "number" ? data.exp : null;
  } catch {
    return null;
  }
}

/** True when token is missing or exp is past (including skew). Unknown exp → not expired. */
export function isAccessTokenExpired(
  token: string | null,
  skewSec: number = DEFAULT_SKEW_SEC,
): boolean {
  if (!token) return true;
  const exp = getJwtExpiryUtcSeconds(token);
  if (exp == null) return false;
  const now = Math.floor(Date.now() / 1000);
  return exp <= now + skewSec;
}
