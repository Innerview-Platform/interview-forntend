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
import { apiLeaveRoom, type RoomParticipantInfo } from "@/lib/room-api";
import { ensureInterviewIdForRoom } from "@/lib/interview-api";
import { siteConfig } from "@/lib/site-config";
import {
  useSharedEditor,
  type RoomSignalMessage,
  type UseSharedEditorReturn,
} from "@/hooks/useSharedEditor";
import { canonicalUserKey } from "@/lib/user-id";

function mergeParticipant(
  list: RoomParticipantInfo[],
  userId: string,
  patch?: Partial<RoomParticipantInfo>,
): RoomParticipantInfo[] {
  const k = canonicalUserKey(userId);
  const i = list.findIndex((p) => canonicalUserKey(p.userId) === k);
  if (i === -1) return [...list, { userId, ...patch }];
  const next = [...list];
  next[i] = { ...next[i], ...patch };
  return next;
}

function removeParticipant(
  list: RoomParticipantInfo[],
  userId: string,
): RoomParticipantInfo[] {
  const k = canonicalUserKey(userId);
  return list.filter((p) => canonicalUserKey(p.userId) !== k);
}

export type RoomSessionValue = UseSharedEditorReturn & {
  /** STOMP transport / CONNECT failure (see `mapStompConnectFailureMessage`). */
  joinError: string | null;
  participants: RoomParticipantInfo[];
  /** Reserved for future presence labels; collaborator code carets use `remoteCursors` + `/cursors`. */
  presenceNames: Record<string, string>;
  /** No `ROLE` signals on `/topic/room/{id}` - typically `MANY` rooms per backend. */
  rosterLimited: boolean;
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

  const [participants, setParticipants] = useState<RoomParticipantInfo[]>([]);
  const [rosterLimited, setRosterLimited] = useState(false);
  const [presenceNames] = useState<Record<string, string>>({});

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
    if (!token || !user?.id || !roomId.trim()) return;
    void ensureInterviewIdForRoom(roomId).catch(() => {});
  }, [token, user?.id, roomId]);

  useEffect(() => {
    if (!token || !user?.id) return;
    const uid = user.id;
    queueMicrotask(() => {
      setParticipants([{ userId: uid }]);
      setRosterLimited(false);
    });
    hook.connect();

    return () => {
      hook.disconnect();
      void apiLeaveRoom(roomId).catch(() => {});
    };
  }, [token, user?.id, roomId, hook.connect, hook.disconnect]); // eslint-disable-line react-hooks/exhaustive-deps -- omit `hook` object; callbacks stable

  useEffect(() => {
    const uid = user?.id;
    if (!uid) return;

    return hook.addRoomTopicListener((msg: RoomSignalMessage) => {
      const t = msg.type;

      if (t === "ROLE" && msg.payload && typeof msg.payload === "object") {
        const pl = msg.payload as Record<string, unknown>;
        const tid =
          typeof pl.targetUserId === "string" ? pl.targetUserId.trim() : "";
        if (tid) {
          setParticipants((prev) => mergeParticipant(prev, tid));
        }
        return;
      }

      if (t === "USER_DISCONNECTED") {
        const raw = msg as Record<string, unknown>;
        const left =
          typeof raw.userId === "string"
            ? raw.userId
            : typeof msg.userId === "string"
              ? msg.userId
              : "";
        if (left) {
          setParticipants((prev) => removeParticipant(prev, left));
        }
        return;
      }

      if (t === "PARTICIPANT_INTERVIEW_ROLE") {
        const pl = msg.payload as Record<string, unknown> | undefined;
        const nr =
          pl && typeof pl.newRole === "string" ? pl.newRole : undefined;
        const target =
          typeof msg.userId === "string" ? msg.userId.trim() : "";
        if (target && nr) {
          setParticipants((prev) =>
            mergeParticipant(prev, target, { interviewRole: nr }),
          );
        }
        return;
      }

      if (
        t === "OFFER" ||
        t === "ANSWER" ||
        t === "ICE_CANDIDATE"
      ) {
        const sid =
          typeof msg.senderId === "string" ? msg.senderId.trim() : "";
        if (sid && canonicalUserKey(sid) !== canonicalUserKey(uid)) {
          setParticipants((prev) => mergeParticipant(prev, sid));
        }
      }
    });
  }, [hook.addRoomTopicListener, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- omit `hook` object

  /** If `ONE_ON_ONE`, server sends WebRTC `ROLE` soon after `JOIN`. Otherwise assume `MANY` (no roster broadcast). */
  useEffect(() => {
    if (hook.wsState !== "connected") {
      queueMicrotask(() => setRosterLimited(false));
      return;
    }
    if (hook.webrtcSelfRole != null) {
      queueMicrotask(() => setRosterLimited(false));
      return;
    }
    const t = window.setTimeout(() => setRosterLimited(true), 4000);
    return () => window.clearTimeout(t);
  }, [hook.wsState, hook.webrtcSelfRole]);

  const joinError = hook.connectFailure;

  const value: RoomSessionValue = {
    ...hook,
    joinError,
    participants,
    presenceNames,
    rosterLimited,
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
