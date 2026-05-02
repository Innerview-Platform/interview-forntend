"use client";

import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Square,
  Video,
  VideoOff,
} from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useSyncExternalStore } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  getClientSessionSnapshot,
  getServerClientSessionSnapshot,
  subscribeClientSession,
} from "@/lib/client-session";
import { siteConfig } from "@/lib/site-config";
import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";
import { useRoomMedia } from "@/app/(app)/room/[roomId]/room-media-context";

export function VideoRoomView() {
  const router = useRouter();
  const params = useParams();
  const roomId =
    typeof params.roomId === "string"
      ? params.roomId
      : Array.isArray(params.roomId)
        ? params.roomId[0]
        : "";

  const { token, user } = useSyncExternalStore(
    subscribeClientSession,
    getClientSessionSnapshot,
    getServerClientSessionSnapshot,
  );

  const { wsState, joinError, webrtcSelfRole } = useRoomSession();
  const media = useRoomMedia();

  const stageRef = useRef<HTMLVideoElement>(null);

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
    startPreview,
    joinCall,
    hangUp,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    screenSharing,
    leaveRoomToDashboard,
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

  useEffect(() => {
    if (!token || !user?.id) {
      router.replace(siteConfig.routes.login);
    }
  }, [router, token, user?.id]);

  if (!roomId) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted">
        Invalid room…
      </div>
    );
  }

  if (!token || !user?.id) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted">
        Redirecting…
      </div>
    );
  }

  const wsLabel =
    wsState === "connected"
      ? "Connected"
      : wsState === "connecting"
        ? "Connecting…"
        : "Offline";

  const stageLabel = localScreenStream
    ? "Your screen"
    : remoteScreenStream
      ? "Peer screen"
      : remoteStream
        ? "Peer video"
        : rtcState === "connecting"
          ? "Connecting…"
          : "Waiting for peer…";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          Video · STOMP signaling ({wsLabel})
          {webrtcSelfRole ? ` · ${webrtcSelfRole}` : ""}
        </p>
      </div>

      {joinError ? (
        <GlassCard className="border-red-500/25 p-4 text-sm text-red-200">
          {joinError}
        </GlassCard>
      ) : null}

      {!preJoinDone ? (
        <GlassCard className="space-y-5 p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Camera & microphone
            </h2>
            <p className="mt-2 text-sm text-muted">
              Preview devices, then join. Video tiles also appear in the
              floating dock after you join.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void startPreview()}
              className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium hover:bg-white/5"
            >
              Preview devices
            </button>
            <button
              type="button"
              onClick={() => void joinCall()}
              disabled={wsState !== "connected"}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600/90 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              {wsState !== "connected" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              Join call
            </button>
          </div>
          {mediaError ? (
            <p className="text-sm text-red-300">{mediaError}</p>
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
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/60">
            <video
              ref={stageRef}
              className="h-full max-h-[min(72vh,720px)] w-full object-contain"
              playsInline
              autoPlay
              muted={!!localScreenStream}
            />
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-black/65 px-2 py-1 text-[11px] text-white">
              {stageLabel}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleAudio}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${
                audioOn
                  ? "border-white/20 bg-white/10"
                  : "border-red-400/40 bg-red-500/25"
              }`}
              aria-label={audioOn ? "Mute" : "Unmute"}
            >
              {audioOn ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              onClick={toggleVideo}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${
                videoOn
                  ? "border-white/20 bg-white/10"
                  : "border-amber-400/40 bg-amber-500/25"
              }`}
              aria-label={videoOn ? "Camera off" : "Camera on"}
            >
              {videoOn ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </button>
            {screenSharing ? (
              <button
                type="button"
                onClick={stopScreenShare}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/20 px-4 py-2 text-sm text-amber-100"
              >
                <Square className="h-4 w-4" />
                Stop share
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void startScreenShare()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm"
              >
                <MonitorUp className="h-4 w-4" />
                Share screen
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                hangUp();
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-muted hover:bg-white/5"
            >
              Disconnect AV
            </button>
            <button
              type="button"
              onClick={leaveRoomToDashboard}
              className="inline-flex items-center gap-2 rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-2 text-sm text-red-100"
            >
              <PhoneOff className="h-4 w-4" />
              Leave room
            </button>
            <span className="ml-auto font-mono text-[11px] text-muted">
              RTC {rtcState}
              {rtcError ? ` · ${rtcError}` : ""}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
