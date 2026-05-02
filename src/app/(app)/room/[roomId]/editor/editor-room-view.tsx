"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { SharedMonacoEditor } from "@/components/room/SharedMonacoEditor";
import {
  getClientSessionSnapshot,
  getServerClientSessionSnapshot,
  subscribeClientSession,
} from "@/lib/client-session";
import { siteConfig } from "@/lib/site-config";

export function EditorRoomView() {
  const router = useRouter();
  const { token, user } = useSyncExternalStore(
    subscribeClientSession,
    getClientSessionSnapshot,
    getServerClientSessionSnapshot,
  );

  useEffect(() => {
    if (!token || !user?.id) {
      router.replace(siteConfig.routes.login);
    }
  }, [router, token, user?.id]);

  if (!token || !user?.id) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-muted">
        Redirecting to sign in…
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SharedMonacoEditor />
    </div>
  );
}
