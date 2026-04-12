import { API_BASE_URL } from "@/lib/api-config";

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
    throw new Error(await readErrorMessage(res));
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
    throw new Error(await readErrorMessage(res));
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
    throw new Error(await readErrorMessage(res));
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
  const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: payload.token.trim(),
      new_password: payload.new_password,
      new_password_confirm: payload.new_password_confirm,
    }),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  const body = (await res.json()) as { message?: string };
  return {
    ok: true,
    message: body.message ?? "Password has been reset successfully.",
  };
}

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
    throw new Error(await readErrorMessage(res));
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
    const msg = await readErrorMessage(res);
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
