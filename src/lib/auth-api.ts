import { API_BASE_URL } from "@/lib/api-config";

const ACCESS_TOKEN_KEY = "innerview_access_token";

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  else localStorage.removeItem(ACCESS_TOKEN_KEY);
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
    ) {
      return (data as { error: string }).error;
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
  return {
    ok: true,
    id: body.id ?? "",
    email: body.email ?? "",
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

/** Full navigation so the browser can complete OAuth2 and cookies. */
export function navigateToGoogleLogin(): void {
  window.location.href = `${API_BASE_URL}/api/auth/google/login`;
}
