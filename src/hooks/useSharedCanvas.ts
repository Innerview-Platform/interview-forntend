"use client";

import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";

/** Canvas sync uses the same STOMP session as `useSharedEditor` (see `RoomSessionProvider`). */
export function useSharedCanvas() {
  const s = useRoomSession();
  return {
    wsState: s.wsState,
    canvasSnapshotJson: s.canvasSnapshotJson,
    canvasRemoteVersion: s.canvasRemoteVersion,
    sendCanvasUpdate: s.sendCanvasUpdate,
  };
}
