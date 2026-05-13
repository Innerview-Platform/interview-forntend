/**
 * Normalises backend error JSON per `_helper/Documentations/features/errors_and_pagination.md`:
 * some handlers use `{ error }`, others `{ message }`, submissions may return `UnsupportedLanguageResponse`.
 */

export type UnsupportedLanguageBody = {
  error: string;
  supportedLanguages: string[];
};

export function isUnsupportedLanguageBody(
  data: unknown,
): data is UnsupportedLanguageBody {
  if (!data || typeof data !== "object") return false;
  const o = data as Record<string, unknown>;
  return (
    typeof o.error === "string" &&
    Array.isArray(o.supportedLanguages) &&
    o.supportedLanguages.every((x) => typeof x === "string")
  );
}

/** First non-empty string from `error`, `message`, or nested map `error` key. */
export function parseApiErrorBody(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const err = o.error;
  if (typeof err === "string" && err.trim()) return err;
  const msg = o.message;
  if (typeof msg === "string" && msg.trim()) return msg;
  return null;
}

export function formatUnsupportedLanguageMessage(body: UnsupportedLanguageBody): string {
  const langs = body.supportedLanguages.join(", ");
  return langs
    ? `${body.error} Supported: ${langs}.`
    : body.error;
}

/**
 * Reads JSON (or first 200 chars of text) from a failed `Response` and returns a user-facing message.
 */
export async function readApiErrorMessage(res: Response): Promise<string> {
  try {
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      const data: unknown = await res.json();
      if (isUnsupportedLanguageBody(data)) {
        return formatUnsupportedLanguageMessage(data);
      }
      const parsed = parseApiErrorBody(data);
      if (parsed) return parsed;
    } else {
      const text = await res.text();
      if (text) return text.slice(0, 200);
    }
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status})`;
}
