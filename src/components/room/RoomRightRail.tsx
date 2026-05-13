"use client";

import { MessageSquare, Users, X } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
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
import { canonicalUserKey, sameUserIdentity } from "@/lib/user-id";

/** Slim strip + expandable panel - default collapsed so the editor keeps full width. */
export function RoomRightRail() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [tab, setTab] = useState<"people" | "chat">("people");
  const { user } = useSyncExternalStore(
    subscribeClientSession,
    getClientSessionSnapshot,
    getServerClientSessionSnapshot,
  );
  const { participants, presenceNames, rosterLimited } = useRoomSession();

  const ids = new Set<string>();
  if (user?.id) ids.add(user.id);
  participants.forEach((p) => ids.add(p.userId));
  const list = Array.from(ids);

  const stripBtn = (active: boolean) =>
    `flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
      active
        ? "border-accent/50 bg-accent/15 text-violet-100"
        : "border-transparent text-muted hover:bg-white/5 hover:text-foreground"
    }`;

  return (
    <div className="flex h-full min-h-0 shrink-0">
      <nav
        className="flex w-11 shrink-0 flex-col items-center gap-1 border-l border-white/10 bg-surface/50 py-2"
        aria-label="Participants and messages"
      >
        <button
          type="button"
          title="Participants"
          className={stripBtn(panelOpen && tab === "people")}
          onClick={() => {
            if (panelOpen && tab === "people") {
              setPanelOpen(false);
            } else {
              setTab("people");
              setPanelOpen(true);
            }
          }}
        >
          <Users className="h-5 w-5" aria-hidden />
          <span className="sr-only">Participants</span>
        </button>
        <button
          type="button"
          title="Messages"
          className={stripBtn(panelOpen && tab === "chat")}
          onClick={() => {
            if (panelOpen && tab === "chat") {
              setPanelOpen(false);
            } else {
              setTab("chat");
              setPanelOpen(true);
            }
          }}
        >
          <MessageSquare className="h-5 w-5" aria-hidden />
          <span className="sr-only">Messages</span>
        </button>
      </nav>

      {panelOpen ? (
        <aside className="flex w-[min(272px,78vw)] shrink-0 flex-col border-l border-white/10 bg-background/92">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-2 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
              {tab === "people" ? "Participants" : "Messages"}
            </p>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-foreground"
              title="Collapse"
              aria-label="Collapse sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {tab === "people" ? (
              <>
                {rosterLimited ? (
                  <p className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-2 text-xs text-amber-100/95">
                    This room type does not broadcast a live roster. Other
                    participants may appear after video or signaling traffic.
                  </p>
                ) : null}
                <ul className="space-y-2">
                {list.map((id) => {
                  const self = user?.id ? sameUserIdentity(id, user.id) : false;
                  const pMeta = participants.find((p) =>
                    sameUserIdentity(p.userId, id),
                  );
                  const fromPresence =
                    presenceNames[canonicalUserKey(id)] ??
                    presenceNames[id.toLowerCase()];
                  const label =
                    self && user?.email
                      ? user.email.split("@")[0] ?? user.email
                      : fromPresence ?? id.slice(0, 8);
                  const colors = getUserColorCss(id);
                  const initials = initialsFromLabel(label, id);
                  return (
                    <li
                      key={id}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2 py-2"
                      style={{
                        borderLeftWidth: 3,
                        borderLeftColor: colors.ring,
                      }}
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
                            <span className="ml-1 text-[10px] text-muted">
                              (you)
                            </span>
                          ) : null}
                        </p>
                        <p className="truncate font-mono text-[10px] text-muted">
                          {id}
                        </p>
                        {pMeta?.interviewRole ? (
                          <p className="text-[10px] uppercase tracking-wide text-muted">
                            {pMeta.interviewRole.replace(/_/g, " ")}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
                </ul>
              </>
            ) : (
              <div className="space-y-3 text-sm text-muted">
                <p>Group chat is not wired to the server yet.</p>
                <p className="text-xs">
                  Planned: STOMP{" "}
                  <code className="rounded bg-white/10 px-1">CHAT_MESSAGE</code>{" "}
                  →{" "}
                  <code className="rounded bg-white/10 px-1">
                    /topic/room/…/chat
                  </code>
                  .
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
      ) : null}
    </div>
  );
}
