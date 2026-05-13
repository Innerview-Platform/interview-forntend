import { API_BASE_URL } from "@/lib/api-config";
import { readApiErrorMessage } from "@/lib/api-error";
import { siteConfig } from "@/lib/site-config";

const ACCESS_TOKEN_KEY = "innerview_access_token";
const USER_KEY = "innerview_user";

/** Dispatched on window after login, logout, refresh, or session clear. */
export const INNERVIEW_AUTH_CHANGED_EVENT = "innerview-auth-changed";

function notifyAuthChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(INNERVIEW_AUTH_CHANGED_EVENT));
}

export type StoredUser = {
  id: string;
  email: string;
};

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  else localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as StoredUser;
    if (data && typeof data.id === "string" && typeof data.email === "string") {
      return data;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function setStoredUser(user: StoredUser | null): void {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function clearClientSession(): void {
  setStoredAccessToken(null);
  setStoredUser(null);
  notifyAuthChanged();
}

const AUTH_ROUTE_BASES = new Set<string>([
  siteConfig.routes.login,
  siteConfig.routes.signup,
  siteConfig.routes.forgotPassword,
  siteConfig.routes.resetPassword,
]);

/** Same-origin return path only (leading slash, no scheme). */
export function buildLoginUrlWithNext(returnPath: string): string {
  let path = returnPath.trim() || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.startsWith("//")) path = "/";
  return `${siteConfig.routes.login}?next=${encodeURIComponent(path)}`;
}

/**
 * If the API responds 401: clear client session only. `RequireAuth` performs a single
 * `location.replace` to login with `next` so we avoid double navigation (assign + router).
 * Skips when already on auth routes to avoid loops.
 * @returns true if session was cleared (caller should abort).
 */
export function redirectIfUnauthorizedResponse(res: Response): boolean {
  if (res.status !== 401 || typeof window === "undefined") return false;
  const pathname = window.location.pathname.split("?")[0] ?? "";
  if (AUTH_ROUTE_BASES.has(pathname)) return false;

  clearClientSession();
  return true;
}

/** Call after authenticated `fetch`; throws if redirect was triggered. */
export function throwRedirectingIfUnauthorized(res: Response): void {
  if (redirectIfUnauthorizedResponse(res)) {
    throw new Error("Unauthorized - redirecting to sign in.");
  }
}

/**
 * Validates `next` query after login/signup - same-origin paths only (no protocol-relative).
 */
export function getSafePostLoginPath(nextRaw: string | null | undefined): string {
  const fallback = siteConfig.routes.dashboard;
  if (nextRaw == null || String(nextRaw).trim() === "") return fallback;

  let path: string;
  try {
    path = decodeURIComponent(String(nextRaw).trim());
  } catch {
    return fallback;
  }

  path = path.split("#")[0] ?? path;
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;

  const baseOnly = path.split("?")[0] ?? path;
  if (AUTH_ROUTE_BASES.has(baseOnly)) return fallback;

  return path || fallback;
}

export type LoginResult = {
  ok: true;
  id: string;
  email: string;
  message: string;
};

export async function apiLogin(
  email: string,
  password: string,
): Promise<LoginResult> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }

  const auth = res.headers.get("Authorization");
  const accessToken = auth?.startsWith("Bearer ")
    ? auth.slice("Bearer ".length).trim()
    : null;
  if (accessToken) setStoredAccessToken(accessToken);

  const body = (await res.json()) as { id?: string; email?: string };
  const id = body.id ?? "";
  const emailOut = body.email ?? "";
  setStoredUser({ id, email: emailOut });
  notifyAuthChanged();

  return {
    ok: true,
    id,
    email: emailOut,
    message: "Signed in.",
  };
}

export async function apiRegister(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<{ ok: true; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name.trim(),
      email: payload.email.trim(),
      password: payload.password,
      password_confirmation: payload.password_confirmation,
    }),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }

  const body = (await res.json()) as { message?: string };
  return {
    ok: true,
    message: body.message ?? "Account created.",
  };
}

export async function apiForgotPassword(
  email: string,
): Promise<{ ok: true; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }

  const body = (await res.json()) as { message?: string };
  return {
    ok: true,
    message:
      body.message ??
      "If an account with this email exists, a reset link has been sent.",
  };
}

export async function apiResetPassword(payload: {
  token: string;
  new_password: string;
  new_password_confirm: string;
}): Promise<{ ok: true; message: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const access = getStoredAccessToken();
  if (access) headers.Authorization = `Bearer ${access}`;

  const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      token: payload.token.trim(),
      new_password: payload.new_password,
      new_password_confirm: payload.new_password_confirm,
    }),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }

  const body = (await res.json()) as { message?: string };
  return {
    ok: true,
    message: body.message ?? "Password has been reset successfully.",
  };
}

/**
 * Refresh endpoint expects a refresh token in the JSON body; the login cookie is
 * httpOnly at path `/api/auth`, so the browser cannot read it to call this from
 * client JS. Prefer JWT `exp` handling in RequireAuth + 401 session clear until
 * the backend exposes cookie-only refresh or returns refresh in a client-readable way.
 */
export async function apiRefresh(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
}> {
  const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }

  const body = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
  };
  if (!body.access_token || !body.refresh_token) {
    throw new Error("Invalid refresh response");
  }
  setStoredAccessToken(body.access_token);
  notifyAuthChanged();
  return {
    access_token: body.access_token,
    refresh_token: body.refresh_token,
  };
}

export async function apiLogout(): Promise<void> {
  const token = getStoredAccessToken();
  if (!token) {
    clearClientSession();
    return;
  }

  const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await readApiErrorMessage(res);
    // If refresh cookie was never set (wrong path / old sessions), still sign out locally.
    if (
      res.status === 400 &&
      msg.toLowerCase().includes("refresh token cookie")
    ) {
      clearClientSession();
      return;
    }
    throw new Error(msg);
  }

  clearClientSession();
}

/** Full navigation so the browser can complete OAuth2 and cookies. */
export function navigateToGoogleLogin(): void {
  window.location.href = `${API_BASE_URL}/api/auth/google/login`;
}
