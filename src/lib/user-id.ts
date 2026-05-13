/**
 * Normalize UUID / user id strings so API body, JWT subject, and STOMP payloads
 * compare equal (hyphens optional, casing ignored).
 */
export function canonicalUserKey(id: string): string {
  return id.trim().toLowerCase().replace(/-/g, "");
}

export function sameUserIdentity(a: string, b: string): boolean {
  const na = canonicalUserKey(a);
  const nb = canonicalUserKey(b);
  return na.length > 0 && nb.length > 0 && na === nb;
}

/** Read JWT `sub` (matches Spring access token subject = user UUID). */
export function parseJwtSubject(accessToken: string): string | null {
  if (!accessToken || accessToken.length < 12) return null;
  try {
    const payloadSeg = accessToken.split(".")[1];
    if (!payloadSeg) return null;
    const base64 = payloadSeg.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = base64 + "=".repeat(padLen);
    const json = JSON.parse(atob(padded)) as { sub?: unknown };
    const sub = json.sub;
    return typeof sub === "string" && sub.length > 0 ? sub : null;
  } catch {
    return null;
  }
}
