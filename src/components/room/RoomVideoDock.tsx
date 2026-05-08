"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useRoomMedia } from "@/app/(app)/room/[roomId]/room-media-context";

const SLOT_COUNT = 4;

/** Match `/room/{id}/editor` — video tiles are inlined there when a call is active. */
function isEmbeddedRoomEditorPath(pathname: string | null) {
  if (!pathname) return false;
  return /\/room\/[^/]+\/editor$/.test(pathname);
}

export function RoomVideoDock() {
  const pathname = usePathname();
  const inlineVideoUi = isEmbeddedRoomEditorPath(pathname);

  const {
    localStream,
    remoteStream,
    callActive,
    dockMinimized,
    setDockMinimized,
  } = useRoomMedia();

  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = localRef.current;
    if (!el || !localStream) return;
    el.srcObject = localStream;
    void el.play().catch(() => {});
  }, [localStream]);

  useEffect(() => {
    const el = remoteRef.current;
    if (!el || !remoteStream) return;
    el.srcObject = remoteStream;
    void el.play().catch(() => {});
  }, [remoteStream]);

  if (!callActive) return null;
  /* Avoid twin local/remote tiles when the unified editor page embeds AV. */
  if (inlineVideoUi) return null;

  return (
    <div
      className={`fixed right-6 z-50 flex flex-col gap-2 transition-all ${
        dockMinimized ? "bottom-6 w-44" : "bottom-6 w-[min(420px,calc(100vw-2rem))]"
      }`}
    >
      <button
        type="button"
        onClick={() => setDockMinimized(!dockMinimized)}
        className="ml-auto flex items-center gap-1 rounded-lg border border-white/15 bg-black/70 px-2 py-1 text-[11px] text-muted backdrop-blur hover:bg-black/80"
      >
        {dockMinimized ? (
          <>
            <ChevronUp className="h-3.5 w-3.5" /> Expand videos
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5" /> Minimize
          </>
        )}
      </button>
      {!dockMinimized ? (
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/15 bg-black/60 p-2 shadow-xl backdrop-blur">
          {Array.from({ length: SLOT_COUNT }).map((_, i) => {
            if (i === 0) {
              return (
                <div
                  key="local"
                  className="relative aspect-video overflow-hidden rounded-lg bg-black/50"
                >
                  <video
                    ref={localRef}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    autoPlay
                  />
                  <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                    You
                  </span>
                </div>
              );
            }
            if (i === 1) {
              return (
                <div
                  key="remote"
                  className="relative aspect-video overflow-hidden rounded-lg bg-black/50"
                >
                  <video
                    ref={remoteRef}
                    className="h-full w-full object-cover"
                    playsInline
                    autoPlay
                  />
                  {!remoteStream ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted">
                      Peer…
                    </div>
                  ) : null}
                  <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                    Peer
                  </span>
                </div>
              );
            }
            return (
              <div
                key={`empty-${i}`}
                className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/40 text-[10px] text-muted"
              >
                Empty
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-white/15 bg-black/70 p-1 text-center text-[10px] text-muted backdrop-blur">
          Video dock minimized
        </div>
      )}
    </div>
  );
}
