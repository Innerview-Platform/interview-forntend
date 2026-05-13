"use client";

import { ChevronDown, ChevronUp, GripHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { RoomVideoPanel } from "@/components/room/RoomVideoPanel";

export type FloatRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function videoFloatStorageKey(roomId: string): string {
  return `innerview:roomVideoFloat:v1:${encodeURIComponent(roomId)}`;
}

function defaultFloatRect(): FloatRect {
  if (typeof window === "undefined") {
    return { x: 80, y: 80, width: 360, height: 420 };
  }
  const w = Math.min(400, Math.max(280, window.innerWidth * 0.28));
  const h = Math.min(520, Math.max(220, window.innerHeight * 0.42));
  return {
    x: Math.max(16, window.innerWidth - w - 24),
    y: 88,
    width: w,
    height: h,
  };
}

function parseFloatRect(raw: string | null): FloatRect | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    const x = Number(o.x);
    const y = Number(o.y);
    const width = Number(o.width);
    const height = Number(o.height);
    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width < 200 ||
      height < 160
    ) {
      return null;
    }
    return { x, y, width, height };
  } catch {
    return null;
  }
}

type Props = {
  roomId: string;
  joinError?: string | null;
};

export function FloatingInterviewVideo({ roomId, joinError }: Props) {
  const [minimized, setMinimized] = useState(false);
  const expandedRectRef = useRef<FloatRect | null>(null);
  const [rect, setRect] = useState<FloatRect>(() => {
    if (typeof window === "undefined") return defaultFloatRect();
    return (
      parseFloatRect(localStorage.getItem(videoFloatStorageKey(roomId))) ??
      defaultFloatRect()
    );
  });

  const persist = useCallback(
    (next: FloatRect) => {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(
          videoFloatStorageKey(roomId),
          JSON.stringify(next),
        );
      } catch {
        /* ignore */
      }
    },
    [roomId],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const parsed = parseFloatRect(
      localStorage.getItem(videoFloatStorageKey(roomId)),
    );
    if (parsed) setRect(parsed);
  }, [roomId]);

  const rndEnable = useMemo(
    () => ({
      top: false,
      right: true,
      bottom: true,
      left: true,
      topRight: false,
      bottomRight: true,
      bottomLeft: true,
      topLeft: false,
    }),
    [],
  );

  if (minimized) {
    return (
      <Rnd
        size={{ width: 200, height: 44 }}
        position={{ x: rect.x, y: rect.y }}
        onDragStop={(_e, d) => {
          const next = { ...rect, x: d.x, y: d.y };
          setRect(next);
          persist(next);
        }}
        bounds="window"
        dragHandleClassName="video-float-drag"
        className="z-50"
      >
        <div className="flex h-full items-center justify-between gap-2 rounded-xl border border-white/15 bg-black/80 px-2 py-1 text-xs text-muted shadow-xl backdrop-blur">
          <span className="video-float-drag flex cursor-grab items-center gap-1 truncate active:cursor-grabbing">
            <GripHorizontal className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Video
          </span>
          <button
            type="button"
            onClick={() => {
              const next = expandedRectRef.current ?? rect;
              setMinimized(false);
              setRect(next);
              persist(next);
            }}
            className="shrink-0 rounded border border-white/15 px-2 py-0.5 text-[10px] text-foreground hover:bg-white/10"
          >
            <ChevronUp className="inline h-3 w-3" aria-hidden /> Expand
          </button>
        </div>
      </Rnd>
    );
  }

  return (
    <Rnd
      size={{ width: rect.width, height: rect.height }}
      position={{ x: rect.x, y: rect.y }}
      onDragStop={(_e, d) => {
        const next = { ...rect, x: d.x, y: d.y };
        setRect(next);
        persist(next);
      }}
      onResizeStop={(_e, _dir, ref, _delta, pos) => {
        const next: FloatRect = {
          x: pos.x,
          y: pos.y,
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        };
        setRect(next);
        persist(next);
      }}
      minWidth={260}
      minHeight={200}
      bounds="window"
      dragHandleClassName="video-float-drag"
      enableResizing={rndEnable}
      className="z-50"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/15 bg-[#080c14]/95 shadow-2xl backdrop-blur-xl">
        <div className="video-float-drag flex shrink-0 cursor-grab items-center justify-between gap-2 border-b border-white/10 bg-surface/70 px-2 py-1.5 active:cursor-grabbing">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Video
          </span>
          <button
            type="button"
            title="Minimize"
            onClick={() => {
              expandedRectRef.current = rect;
              setMinimized(true);
            }}
            className="rounded border border-white/10 p-1 text-muted hover:bg-white/10 hover:text-foreground"
          >
            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-1">
          <RoomVideoPanel variant="embedded" joinError={joinError} />
        </div>
      </div>
    </Rnd>
  );
}
