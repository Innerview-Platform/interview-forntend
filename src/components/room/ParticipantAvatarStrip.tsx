"use client";

import { useMemo } from "react";
import { useSyncExternalStore } from "react";
import {
  getClientSessionSnapshot,
  getServerClientSessionSnapshot,
  subscribeClientSession,
} from "@/lib/client-session";
import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";
import {
  getUserColorCss,
  initialsFromLabel,
} from "@/lib/user-color";

export function ParticipantAvatarStrip() {
  const { user } = useSyncExternalStore(
    subscribeClientSession,
    getClientSessionSnapshot,
    getServerClientSessionSnapshot,
  );
  const { participants, presenceNames } = useRoomSession();

  const rows = useMemo(() => {
    const ids = new Set<string>();
    if (user?.id) ids.add(user.id);
    participants.forEach((p) => ids.add(p.userId));
    return Array.from(ids).slice(0, 8);
  }, [user?.id, participants]);

  return (
    <div className="flex max-w-[min(480px,55vw)] flex-wrap items-center justify-end gap-2">
      {rows.map((id) => {
        const self = id === user?.id;
        const label =
          self && user?.email
            ? user.email.split("@")[0] ?? user.email
            : presenceNames[id] ?? `${id.slice(0, 8)}…`;
        const colors = getUserColorCss(id);
        const initials = initialsFromLabel(label, id);
        return (
          <div
            key={id}
            className="flex items-center gap-2 rounded-full border-2 bg-black/30 py-1 pl-1 pr-2.5 text-[11px] font-medium"
            style={{ borderColor: colors.ring }}
            title={label}
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{ background: colors.dot }}
            >
              {initials}
            </span>
            <span className="max-w-[100px] truncate text-foreground">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
