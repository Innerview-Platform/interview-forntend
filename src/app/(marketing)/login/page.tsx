import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
      <Suspense
        fallback={
          <p className="text-sm text-muted" aria-live="polite">
            Loading…
          </p>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
