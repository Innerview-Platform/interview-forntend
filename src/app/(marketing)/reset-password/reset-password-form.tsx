"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { apiResetPassword } from "@/lib/auth-api";
import { siteConfig } from "@/lib/site-config";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [token, setToken] = useState(tokenFromUrl);

  useEffect(() => {
    const t = searchParams.get("token");
    if (t) setToken(t);
  }, [searchParams]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!token.trim()) {
      setError("Reset token is missing. Open the link from your email.");
      return;
    }
    setLoading(true);
    try {
      await apiResetPassword({
        token: token.trim(),
        new_password: password,
        new_password_confirm: confirm,
      });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <GlassCard className="w-full max-w-md p-7 sm:p-9">
        <h1 className="text-lg font-semibold text-foreground">
          Password updated
        </h1>
        <p className="mt-2 text-sm text-muted">
          You can sign in with your new password.
        </p>
        <Link
          href={siteConfig.routes.login}
          className="mt-6 inline-block text-sm font-semibold text-accent hover:underline"
        >
          Go to sign in
        </Link>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="w-full max-w-md p-7 sm:p-9">
      <div className="mb-8 text-center">
        <Link
          href={siteConfig.routes.home}
          className="inline-flex items-center"
        >
          <BrandLogo />
        </Link>
        <h1 className="mt-4 text-lg font-semibold text-foreground">
          Set a new password
        </h1>
        <p className="mt-2 text-sm text-muted">
          Use the token from your email, or paste it below.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          id="reset-token"
          label="Reset token"
          type="text"
          required
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste token from email link"
          autoComplete="off"
        />
        <Input
          id="reset-password"
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <Input
          id="reset-confirm"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
        />
        <p className="text-xs text-muted">
          Password rules match the API: include an uppercase letter, a number,
          and a special character from{" "}
          <span className="font-mono text-foreground/80">@$!%*?&</span> only.
        </p>
        {error ? (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-rose-100" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        <Link href={siteConfig.routes.login} className="text-accent hover:underline">
          Back to sign in
        </Link>
      </p>
    </GlassCard>
  );
}
