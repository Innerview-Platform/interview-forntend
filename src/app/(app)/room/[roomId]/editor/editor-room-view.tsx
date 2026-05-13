"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { FloatingInterviewVideo } from "@/components/room/FloatingInterviewVideo";
import { InterviewWorkspace } from "@/app/(app)/room/[roomId]/editor/InterviewWorkspace";
import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";
import {
  getClientSessionSnapshot,
  getServerClientSessionSnapshot,
  subscribeClientSession,
} from "@/lib/client-session";
import { siteConfig } from "@/lib/site-config";

export function EditorRoomView() {
  const router = useRouter();
  const params = useParams();
  const roomId =
    typeof params.roomId === "string"
      ? params.roomId
      : Array.isArray(params.roomId)
        ? params.roomId[0] ?? ""
        : "";

  const { joinError } = useRoomSession();
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
    <div className="relative flex min-h-0 flex-1 flex-col">
      <InterviewWorkspace roomId={roomId} />
      {roomId ? (
        <FloatingInterviewVideo roomId={roomId} joinError={joinError} />
      ) : null}
    </div>
  );
}
