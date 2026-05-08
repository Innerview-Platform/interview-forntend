"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { SharedMonacoEditor } from "@/components/room/SharedMonacoEditor";
import { CompileOutputPanel } from "@/components/room/CompileOutputPanel";
import { RoomVideoPanel } from "@/components/room/RoomVideoPanel";
import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";
import {
  getClientSessionSnapshot,
  getServerClientSessionSnapshot,
  subscribeClientSession,
} from "@/lib/client-session";
import { siteConfig } from "@/lib/site-config";

export function EditorRoomView() {
  const router = useRouter();
  const { wsState, compileResult, compileBusy, clearCompileResult } =
    useRoomSession();
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
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[1fr_minmax(280px,34%)] lg:items-stretch lg:gap-4">
        <div className="flex min-h-[min(360px,52vh)] min-w-0 flex-col lg:min-h-0">
          <SharedMonacoEditor />
        </div>
        <div className="flex min-h-[min(280px,40vh)] min-w-0 flex-col lg:min-h-0">
          <RoomVideoPanel variant="embedded" />
        </div>
      </div>
      <CompileOutputPanel
        wsState={wsState}
        compileResult={compileResult}
        compileBusy={compileBusy}
        clearCompileResult={clearCompileResult}
      />
    </div>
  );
}
