"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { apiLogin } from "@/lib/auth-api";
import { siteConfig } from "@/lib/site-config";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      setSuccess(res.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
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
        <p className="mt-2 text-muted">Welcome back</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          id="login-email"
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Input
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <div className="flex justify-start">
          <Link
            href={siteConfig.routes.forgotPassword}
            className="text-sm text-accent hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm text-accent" role="status">
            {success}
          </p>
        ) : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Login"}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        New here?{" "}
        <Link
          href={siteConfig.routes.signup}
          className="font-semibold text-accent hover:underline"
        >
          Sign up
        </Link>
      </p>
    </GlassCard>
  );
}
