"use client";

import {
  Loader2,
  Mic,
  MicOff,
  MonitorUp,
  Square,
  Video,
  VideoOff,
} from "lucide-react";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  getClientSessionSnapshot,
  getServerClientSessionSnapshot,
  subscribeClientSession,
} from "@/lib/client-session";
import { getLiveKitUrl } from "@/lib/video-config";
import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";
import { useRoomMedia } from "@/app/(app)/room/[roomId]/room-media-context";

export type RoomVideoPanelVariant = "page" | "embedded";

type Props = {
  variant?: RoomVideoPanelVariant;
  /** Join / room-session errors surfaced above controls */
  joinError?: string | null;
};

export function RoomVideoPanel({
  variant = "page",
  joinError,
}: Props) {
  const { token } = useSyncExternalStore(
    subscribeClientSession,
    getClientSessionSnapshot,
    getServerClientSessionSnapshot,
  );
  const { wsState, webrtcSelfRole } = useRoomSession();
  const media = useRoomMedia();
  const stageRef = useRef<HTMLVideoElement>(null);

  const embedded = variant === "embedded";

  const {
    localStream,
    localScreenStream,
    remoteStream,
    remoteScreenStream,
    preJoinDone,
    audioOn,
    videoOn,
    rtcState,
    rtcError,
    mediaError,
    videoTransport,
    startPreview,
    joinCall,
    hangUp,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    screenSharing,
  } = media;

  const bindStage = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    if (localScreenStream) {
      el.srcObject = localScreenStream;
    } else if (remoteScreenStream) {
      el.srcObject = remoteScreenStream;
    } else if (remoteStream) {
      el.srcObject = remoteStream;
    } else {
      el.srcObject = null;
    }
    void el.play().catch(() => {});
  }, [localScreenStream, remoteScreenStream, remoteStream]);

  useEffect(() => {
    bindStage();
  }, [bindStage]);

  const wsLabel =
    wsState === "connected"
      ? "Connected"
      : wsState === "connecting"
        ? "Connecting…"
        : "Offline";

  const canJoinCall =
    videoTransport === "livekit"
      ? !!token && !!getLiveKitUrl()
      : wsState === "connected";

  const stageLabel = localScreenStream
    ? "Your screen"
    : remoteScreenStream
      ? "Peer screen"
      : remoteStream
        ? "Peer video"
        : rtcState === "connecting"
          ? "Connecting…"
          : "Waiting for peer…";

  const controlBtn =
    embedded
      ? "inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm"
      : "inline-flex h-11 w-11 items-center justify-center rounded-xl border text-base";

  const StageVideoClass = embedded
    ? "h-full w-full max-h-[min(42vh,360px)] object-contain"
    : "h-full max-h-[min(72vh,720px)] w-full object-contain";

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col ${embedded ? "gap-2" : "gap-4"}`}
    >
      <div className="shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          Video ·{" "}
          {videoTransport === "livekit"
            ? "LiveKit SFU"
            : `STOMP (${wsLabel})`}
          {videoTransport === "p2p" && webrtcSelfRole
            ? ` · ${webrtcSelfRole}`
            : ""}
        </p>
      </div>

      {joinError ? (
        <GlassCard className="border-red-500/25 p-3 text-sm text-red-200 lg:p-4">
          {joinError}
        </GlassCard>
      ) : null}

      {!preJoinDone ? (
        <GlassCard className={`space-y-4 ${embedded ? "p-4" : "space-y-5 p-6"}`}>
          <div>
            <h2
              className={`font-semibold text-foreground ${embedded ? "text-base" : "text-lg"}`}
            >
              Camera & microphone
            </h2>
            <p className={`mt-1.5 text-muted ${embedded ? "text-xs" : "mt-2 text-sm"}`}>
              Preview devices, then join.{" "}
              {embedded
                ? "Video stays in this column while you code."
                : "You can dock tile previews from the tray after joining."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void startPreview()}
              className="rounded-xl border border-white/20 px-3 py-2 text-xs font-medium hover:bg-white/5 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              Preview devices
            </button>
            <button
              type="button"
              onClick={() => void joinCall()}
              disabled={!canJoinCall}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600/90 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              {!canJoinCall && videoTransport === "p2p" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              Join call
            </button>
          </div>
          {mediaError ? (
            <p className="text-xs text-red-300 sm:text-sm">{mediaError}</p>
          ) : null}
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/50">
            <video
              className="aspect-video w-full object-cover"
              muted
              playsInline
              autoPlay
              ref={(el) => {
                if (el && localStream) el.srcObject = localStream;
              }}
            />
          </div>
        </GlassCard>
      ) : (
        <>
          <div
            className={`relative flex min-h-0 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/60 ${embedded ? "aspect-video max-h-[min(42vh,360px)] min-h-[140px] w-full" : "flex-1"}`}
          >
            <video
              ref={stageRef}
              className={StageVideoClass}
              playsInline
              autoPlay
              muted={!!localScreenStream}
            />
            <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] text-white sm:bottom-3 sm:left-3 sm:rounded-lg sm:px-2 sm:py-1 sm:text-[11px]">
              {stageLabel}
            </div>
          </div>

          <div className="flex flex-shrink-0 flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggleAudio}
              className={`${controlBtn} ${
                audioOn
                  ? "border-white/20 bg-white/10"
                  : "border-red-400/40 bg-red-500/25"
              }`}
              aria-label={audioOn ? "Mute" : "Unmute"}
            >
              {audioOn ? (
                <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
            <button
              type="button"
              onClick={toggleVideo}
              className={`${controlBtn} ${
                videoOn
                  ? "border-white/20 bg-white/10"
                  : "border-amber-400/40 bg-amber-500/25"
              }`}
              aria-label={videoOn ? "Camera off" : "Camera on"}
            >
              {videoOn ? (
                <Video className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <VideoOff className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
            {screenSharing ? (
              <button
                type="button"
                onClick={stopScreenShare}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/20 px-2 py-1.5 text-[11px] text-amber-100 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
              >
                <Square className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Stop share
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void startScreenShare()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-[11px] sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
              >
                <MonitorUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Share screen
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                hangUp();
              }}
              className="inline-flex items-center rounded-lg border border-white/15 px-2 py-1.5 text-[11px] text-muted hover:bg-white/5 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
            >
              Disconnect AV
            </button>
            <span className="ml-auto hidden font-mono text-[10px] text-muted sm:inline sm:text-[11px]">
              RTC {rtcState}
              {rtcError ? ` · ${rtcError}` : ""}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
