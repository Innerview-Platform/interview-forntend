"use client";

import { useState } from "react";
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

export function RoomRightRail() {
  const [tab, setTab] = useState<"people" | "chat">("people");
  const { user } = useSyncExternalStore(
    subscribeClientSession,
    getClientSessionSnapshot,
    getServerClientSessionSnapshot,
  );
  const { participants, presenceNames } = useRoomSession();

  const ids = new Set<string>();
  if (user?.id) ids.add(user.id);
  participants.forEach((p) => ids.add(p.userId));
  const list = Array.from(ids);

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-l border-white/10 bg-black/25">
      <div className="flex border-b border-white/10">
        <button
          type="button"
          onClick={() => setTab("people")}
          className={`flex-1 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide ${
            tab === "people"
              ? "border-b-2 border-teal-400 text-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          Participants
        </button>
        <button
          type="button"
          onClick={() => setTab("chat")}
          className={`flex-1 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide ${
            tab === "chat"
              ? "border-b-2 border-teal-400 text-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          Messages
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {tab === "people" ? (
          <ul className="space-y-2">
            {list.map((id) => {
              const self = id === user?.id;
              const label =
                self && user?.email
                  ? user.email.split("@")[0] ?? user.email
                  : presenceNames[id] ?? id.slice(0, 8);
              const colors = getUserColorCss(id);
              const initials = initialsFromLabel(label, id);
              return (
                <li
                  key={id}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2 py-2"
                  style={{ borderLeftWidth: 3, borderLeftColor: colors.ring }}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ background: colors.dot }}
                  >
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {label}
                      {self ? (
                        <span className="ml-1 text-[10px] text-muted">(you)</span>
                      ) : null}
                    </p>
                    <p className="truncate font-mono text-[10px] text-muted">
                      {id}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="space-y-3 text-sm text-muted">
            <p>Group chat is not wired to the server yet.</p>
            <p className="text-xs">
              Planned: STOMP <code className="rounded bg-white/10 px-1">CHAT_MESSAGE</code>{" "}
              → <code className="rounded bg-white/10 px-1">/topic/room/…/chat</code>.
            </p>
            <textarea
              disabled
              placeholder="Coming soon…"
              className="mt-4 min-h-[88px] w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm opacity-60"
            />
          </div>
        )}
      </div>
    </aside>
  );
}
