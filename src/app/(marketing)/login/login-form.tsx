"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { apiLogin, getSafePostLoginPath } from "@/lib/auth-api";
import { siteConfig } from "@/lib/site-config";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [justRegistered, setJustRegistered] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("innerview_registered_ok") === "1") {
        setJustRegistered(true);
        sessionStorage.removeItem("innerview_registered_ok");
      }
    } catch {
      /* ignore */
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiLogin(email, password);
      const destination = getSafePostLoginPath(
        searchParams.get("next"),
      );
      router.replace(destination);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className="w-full max-w-md p-7 sm:p-9">
      <div className="mb-8">
        <Link
          href={siteConfig.routes.home}
          className="flex items-center justify-center"
        >
          <BrandLogo />
        </Link>
        <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Sign in to open your dashboard and interview rooms.
        </p>
        {justRegistered ? (
          <p className="mt-4 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-emerald-100">
            Account created. Sign in with your email and password.
          </p>
        ) : null}
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
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-rose-100" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Login"}
        </Button>
      </form>
      <div className="mt-6 flex justify-center">
        <Badge tone="neutral">JWT protected workspace</Badge>
      </div>
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
