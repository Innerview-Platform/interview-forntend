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
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await apiForgotPassword(email);
      setSuccess(true);
    } catch (e) {
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
          Enter your email. If an account exists, you&apos;ll receive a link to{" "}
          <Link
            href={siteConfig.routes.resetPassword}
            className="text-accent hover:underline"
          >
            reset your password
          </Link>{" "}
          on this site.
        </p>
      </div>
      {success ? (
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-4 text-center text-sm text-foreground">
          <p className="font-medium text-accent">Check your inbox</p>
          <p className="mt-2 text-muted">
            If an account exists for that address, check your inbox for the
            link.
          </p>
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
      {!success ? (
        <p className="mt-8 text-center text-sm text-muted">
          <Link href={siteConfig.routes.login} className="text-accent hover:underline">
            Back to sign in
          </Link>
        </p>
      ) : null}
    </GlassCard>
  );
}
