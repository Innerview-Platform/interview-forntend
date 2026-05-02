"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  getClientSessionSnapshot,
  getServerClientSessionSnapshot,
  subscribeClientSession,
} from "@/lib/client-session";
import {
  apiJoinRoom,
  apiLeaveRoom,
  parseRoomParticipants,
  type RoomParticipantInfo,
} from "@/lib/room-api";
import { siteConfig } from "@/lib/site-config";
import {
  useSharedEditor,
  type UseSharedEditorReturn,
} from "@/hooks/useSharedEditor";

export type RoomSessionValue = UseSharedEditorReturn & {
  joinError: string | null;
  participants: RoomParticipantInfo[];
  /** Best-effort display names from peer CURSOR_UPDATE payloads. */
  presenceNames: Record<string, string>;
};

const RoomSessionContext = createContext<RoomSessionValue | null>(null);

export function RoomSessionProvider({
  roomId,
  children,
}: {
  roomId: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const { token, user } = useSyncExternalStore(
    subscribeClientSession,
    getClientSessionSnapshot,
    getServerClientSessionSnapshot,
  );

  const [joinError, setJoinError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<RoomParticipantInfo[]>([]);
  const [presenceNames, setPresenceNames] = useState<Record<string, string>>(
    {},
  );

  const hook = useSharedEditor({
    token: token ?? "",
    roomId,
    userId: user?.id ?? "",
  });

  useEffect(() => {
    if (!token || !user?.id) {
      router.replace(siteConfig.routes.login);
    }
  }, [router, token, user?.id]);

  useEffect(() => {
    if (!token || !user?.id) return;
    let cancelled = false;

    (async () => {
      try {
        setJoinError(null);
        const dto = await apiJoinRoom(roomId);
        if (!cancelled) {
          setParticipants(parseRoomParticipants(dto.participants));
          hook.connect();
        }
      } catch (e) {
        setJoinError(e instanceof Error ? e.message : "Could not join room");
      }
    })();

    return () => {
      cancelled = true;
      hook.disconnect();
      void apiLeaveRoom(roomId).catch(() => {});
    };
  }, [token, user?.id, roomId, hook.connect, hook.disconnect]);

  useEffect(() => {
    const uid = user?.id;
    if (!uid) return;
    return hook.addCursorListener((msg) => {
      if (!msg.userId || msg.userId === uid) return;
      const nm = msg.name?.trim();
      if (nm) {
        setPresenceNames((prev) => ({
          ...prev,
          [msg.userId]: nm,
        }));
      }
    });
  }, [hook.addCursorListener, user?.id]);

  const value: RoomSessionValue = {
    ...hook,
    joinError,
    participants,
    presenceNames,
  };

  return (
    <RoomSessionContext.Provider value={value}>
      {children}
    </RoomSessionContext.Provider>
  );
}

export function useRoomSession(): RoomSessionValue {
  const ctx = useContext(RoomSessionContext);
  if (!ctx) {
    throw new Error("useRoomSession must be used within RoomSessionProvider");
  }
  return ctx;
}
