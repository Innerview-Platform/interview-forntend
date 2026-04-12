"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { apiForgotPassword } from "@/lib/auth-api";
import { siteConfig } from "@/lib/site-config";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const res = await apiForgotPassword(email);
      // Backend always returns this same 200 message (no email enumeration).
      setSuccessMessage(res.message);
    } catch (e) {
      // 400 from @Valid → ErrorMessageResponse.error, e.g. "Invalid email format"
      setError(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className="w-full max-w-md p-8 sm:p-10">
      <div className="mb-8 text-center">
        <Link
          href={siteConfig.routes.home}
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          {siteConfig.name}
        </Link>
        <h1 className="mt-4 text-lg font-semibold text-foreground">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-muted">
          Enter your email. The server will send a reset link only if that
          account exists (you&apos;ll see the same confirmation either way).
          Then open{" "}
          <Link
            href={siteConfig.routes.resetPassword}
            className="text-accent hover:underline"
          >
            reset password
          </Link>{" "}
          using the link in the email.
        </p>
      </div>
      {successMessage ? (
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-4 text-center text-sm text-foreground">
          <p className="font-medium text-accent">Done</p>
          <p className="mt-2 text-muted">{successMessage}</p>
          <Link
            href={siteConfig.routes.login}
            className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            id="forgot-email"
            label="Email address"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
      {!successMessage ? (
        <p className="mt-8 text-center text-sm text-muted">
          <Link href={siteConfig.routes.login} className="text-accent hover:underline">
            Back to sign in
          </Link>
        </p>
      ) : null}
    </GlassCard>
  );
}
