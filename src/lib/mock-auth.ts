const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type OAuthProvider = "google" | "github";

export async function mockLogin(email: string, password: string) {
  await delay(650);
  console.log("[mock-auth] login", { email, passwordLength: password.length });
  return { ok: true as const, message: "Signed in (mock)." };
}

export async function mockSignup(payload: {
  name?: string;
  email: string;
  password: string;
}) {
  await delay(800);
  console.log("[mock-auth] signup", {
    name: payload.name,
    email: payload.email,
    passwordLength: payload.password.length,
  });
  return { ok: true as const, message: "Account created (mock)." };
}

export async function mockOAuth(provider: OAuthProvider) {
  await delay(500);
  console.log("[mock-auth] oauth", provider);
  return {
    ok: true as const,
    message: `Continue with ${provider} (mock - no redirect).`,
  };
}

export async function mockRequestPasswordReset(email: string) {
  await delay(600);
  console.log("[mock-auth] password reset", { email });
  return {
    ok: true as const,
    message: "If that email exists, a reset link was sent (mock).",
  };
}
