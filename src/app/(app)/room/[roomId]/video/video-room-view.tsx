"use client";

import { useRouter, useParams } from "next/navigation";
import { Video, Mic, MicOff, VideoOff, PhoneOff, Loader2 } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  getClientSessionSnapshot,
  getServerClientSessionSnapshot,
  subscribeClientSession,
} from "@/lib/client-session";
import { siteConfig } from "@/lib/site-config";
import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";
import { useRoomWebRtc } from "@/hooks/useRoomWebRtc";

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

  const {
    wsState,
    joinError,
    addRoomTopicListener,
    publishSignaling,
    webrtcSelfRole,
  } = useRoomSession();

  const [displayName, setDisplayName] = useState("");
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [preJoinDone, setPreJoinDone] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const { remoteStream, rtcState, rtcError, hangUp } = useRoomWebRtc({
    roomId,
    userId: user?.id ?? "",
    wsConnected: wsState === "connected",
    webrtcSelfRole,
    addRoomTopicListener,
    publishSignaling,
    localStream,
    callActive: preJoinDone && !!localStream,
  });

  useEffect(() => {
    if (!token || !user?.id) {
      router.replace(siteConfig.routes.login);
    }
  }, [router, token, user?.id]);

  useEffect(() => {
    if (user?.email && !displayName) {
      const short = user.email.split("@")[0] ?? user.email;
      setDisplayName(short);
    }
  }, [user?.email, displayName]);

  useEffect(() => {
    const el = localVideoRef.current;
    if (!el || !localStream) return;
    el.srcObject = localStream;
    void el.play().catch(() => {});
  }, [localStream]);

  useEffect(() => {
    const el = remoteVideoRef.current;
    if (!el || !remoteStream) return;
    el.srcObject = remoteStream;
    void el.play().catch(() => {});
  }, [remoteStream]);

  const startPreview = useCallback(async () => {
    setMediaError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoOn,
        audio: audioOn,
      });
      setLocalStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop());
        return stream;
      });
    } catch (e) {
      setMediaError(
        e instanceof Error ? e.message : "Could not access camera or microphone",
      );
    }
  }, [audioOn, videoOn]);

  const handleJoinCall = useCallback(async () => {
    await startPreview();
    setPreJoinDone(true);
  }, [startPreview]);

  const toggleAudio = useCallback(() => {
    setAudioOn((a) => {
      const next = !a;
      localStream?.getAudioTracks().forEach((t) => {
        t.enabled = next;
      });
      return next;
    });
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    setVideoOn((v) => {
      const next = !v;
      localStream?.getVideoTracks().forEach((t) => {
        t.enabled = next;
      });
      return next;
    });
  }, [localStream]);

  useEffect(() => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((t) => (t.enabled = audioOn));
    localStream.getVideoTracks().forEach((t) => (t.enabled = videoOn));
  }, [audioOn, videoOn, localStream]);

  const onLeave = useCallback(() => {
    hangUp();
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setPreJoinDone(false);
    router.push(siteConfig.routes.dashboard);
  }, [hangUp, localStream, router]);

  if (!roomId) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-muted">
        Invalid room…
      </div>
    );
  }

  if (!token || !user?.id) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-muted">
        Redirecting to sign in…
      </div>
    );
  }

  const wsLabel =
    wsState === "connected"
      ? "Connected"
      : wsState === "connecting"
        ? "Connecting…"
        : "Offline";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-sky-500/15 text-sky-300">
          <Video className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Live video (P2P)
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Signaling uses the same STOMP session as the editor (
            <span className="font-mono text-foreground/80">{wsLabel}</span>
            ). Media is peer‑to‑peer with a public STUN server; expect NAT‑dependent
            behavior on some networks.
          </p>
        </div>
      </div>

      {joinError ? (
        <GlassCard className="mb-6 border-red-500/25 p-4 text-sm text-red-200">
          {joinError}
        </GlassCard>
      ) : null}

      {!preJoinDone ? (
        <GlassCard className="space-y-6 p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Before you join
            </p>
            <h2 className="mt-2 text-lg font-semibold text-foreground">
              Camera & microphone
            </h2>
            <p className="mt-2 text-sm text-muted">
              Choose how you appear in the call. You can change devices after
              joining from browser settings if needed.
            </p>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-muted">Display name (optional)</span>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full max-w-md rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-sm text-foreground"
              placeholder="Your name"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void startPreview()}
              className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-white/5"
            >
              Preview devices
            </button>
            <button
              type="button"
              onClick={() => void handleJoinCall()}
              disabled={wsState !== "connected"}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600/90 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-sky-500 disabled:opacity-40"
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

          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
            <video
              ref={localVideoRef}
              className="aspect-video w-full object-cover"
              muted
              playsInline
              autoPlay
            />
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          <GlassCard className="overflow-hidden p-0">
            <div className="grid gap-px bg-white/10 sm:grid-cols-2">
              <div className="relative aspect-video bg-black/50">
                <video
                  ref={remoteVideoRef}
                  className="h-full w-full object-cover"
                  playsInline
                  autoPlay
                />
                {!remoteStream ? (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
                    {rtcState === "connecting"
                      ? "Waiting for peer…"
                      : "No remote video yet"}
                  </div>
                ) : null}
                <span className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2 py-1 text-xs text-white">
                  Remote
                </span>
              </div>
              <div className="relative aspect-video bg-black/50">
                <video
                  ref={localVideoRef}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  autoPlay
                />
                <span className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2 py-1 text-xs text-white">
                  You
                  {webrtcSelfRole ? ` · ${webrtcSelfRole}` : ""}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/25 px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={toggleAudio}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-white transition ${
                    audioOn
                      ? "border-white/20 bg-white/10"
                      : "border-red-400/40 bg-red-500/30"
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
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-white transition ${
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
                <button
                  type="button"
                  onClick={onLeave}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-400/40 bg-red-500/20 px-4 text-sm font-medium text-red-100"
                >
                  <PhoneOff className="h-4 w-4" />
                  Leave
                </button>
              </div>
              <div className="font-mono text-xs text-muted">
                RTC: {rtcState}
                {rtcError ? ` · ${rtcError}` : ""}
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
