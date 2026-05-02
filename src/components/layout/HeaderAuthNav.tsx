"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getStoredAccessToken,
  INNERVIEW_AUTH_CHANGED_EVENT,
} from "@/lib/auth-api";
import { siteConfig } from "@/lib/site-config";

export function HeaderAuthNav() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const sync = () => setAuthed(!!getStoredAccessToken());
    const id = window.setTimeout(sync, 0);
    window.addEventListener(INNERVIEW_AUTH_CHANGED_EVENT, sync);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener(INNERVIEW_AUTH_CHANGED_EVENT, sync);
    };
  }, []);

  if (authed) {
    return (
      <span className="hidden items-center gap-4 sm:inline-flex">
        <Link
          href={siteConfig.routes.dashboard}
          className="text-sm text-white/85 transition hover:text-foreground"
        >
          Dashboard
        </Link>
        <Link
          href={siteConfig.routes.profile}
          className="text-sm text-white/85 transition hover:text-foreground"
        >
          Profile
        </Link>
      </span>
    );
  }

  return (
    <Link
      href={siteConfig.routes.login}
      className="hidden text-sm text-white/85 transition hover:text-foreground sm:inline"
    >
      Sign In
    </Link>
  );
}
