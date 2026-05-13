"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  getClientSessionSnapshot,
  getServerClientSessionSnapshot,
  subscribeClientSession,
} from "@/lib/client-session";
import { getLiveKitUrl, getVideoTransport } from "@/lib/video-config";
import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";
import { useRoomLiveKit } from "@/hooks/useRoomLiveKit";
import { useRoomWebRtc } from "@/hooks/useRoomWebRtc";

export type RoomMediaContextValue = {
  localStream: MediaStream | null;
  localScreenStream: MediaStream | null;
  remoteStream: MediaStream | null;
  remoteScreenStream: MediaStream | null;
  callActive: boolean;
  preJoinDone: boolean;
  audioOn: boolean;
  videoOn: boolean;
  dockMinimized: boolean;
  screenSharing: boolean;
  rtcState: "idle" | "connecting" | "live" | "error";
  rtcError: string | null;
  mediaError: string | null;
  /** `livekit` uses SFU + JWT; `p2p` uses STOMP signaling (INNER-79). */
  videoTransport: ReturnType<typeof getVideoTransport>;
  setDockMinimized: (v: boolean) => void;
  startPreview: () => Promise<void>;
  joinCall: () => Promise<void>;
  hangUp: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  leaveRoomToDashboard: () => void;
};

const RoomMediaContext = createContext<RoomMediaContextValue | null>(null);

export function RoomMediaProvider({
  children,
  onLeaveNavigate,
}: {
  children: ReactNode;
  onLeaveNavigate?: () => void;
}) {
  const params = useParams();
  const roomId =
    typeof params.roomId === "string"
      ? params.roomId
      : Array.isArray(params.roomId)
        ? params.roomId[0]
        : "";

  const { user, token } = useSyncExternalStore(
    subscribeClientSession,
    getClientSessionSnapshot,
    getServerClientSessionSnapshot,
  );

  const {
    wsState,
    addRoomTopicListener,
    publishSignaling,
    webrtcSelfRole,
    participants,
  } = useRoomSession();

  const videoTransport = useMemo(() => getVideoTransport(), []);
  const liveKitUrl = useMemo(() => getLiveKitUrl(), []);

  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [preJoinDone, setPreJoinDone] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [localScreenStream, setLocalScreenStream] =
    useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [dockMinimized, setDockMinimized] = useState(false);

  const callActive =
    preJoinDone &&
    (videoTransport === "livekit" || !!localStream);

  const {
    localStream: liveKitLocalStream,
    localScreenStream: liveKitLocalScreen,
    remoteStream: liveKitRemote,
    remoteScreenStream: liveKitRemoteScreen,
    rtcState: liveKitRtcState,
    rtcError: liveKitRtcError,
    screenSharing: liveKitScreenSharing,
    hangUp: hangUpLiveKit,
    startScreenShare: startScreenShareLiveKit,
    stopScreenShare: stopScreenShareLiveKit,
  } = useRoomLiveKit({
    enabled: videoTransport === "livekit",
    roomId,
    accessToken: token,
    liveKitUrl,
    callActive: videoTransport === "livekit" && preJoinDone,
    cameraEnabled: videoOn,
    micEnabled: audioOn,
  });

  const {
    remoteStream: p2pRemote,
    remoteScreenStream: p2pRemoteScreen,
    rtcState: p2pRtcState,
    rtcError: p2pRtcError,
    hangUp: hangUpRtc,
  } = useRoomWebRtc({
    enabled: videoTransport === "p2p",
    roomId,
    userId: user?.id ?? "",
    wsConnected: wsState === "connected",
    webrtcSelfRole,
    participants,
    addRoomTopicListener,
    publishSignaling,
    localStream,
    localScreenStream,
    callActive: videoTransport === "p2p" && callActive,
  });

  /** Drop gUM preview once LiveKit publishes local camera/mic. */
  useEffect(() => {
    if (videoTransport !== "livekit" || !liveKitLocalStream) return;
    queueMicrotask(() => {
      setLocalStream((prev) => {
        if (!prev) return null;
        prev.getTracks().forEach((t) => t.stop());
        return null;
      });
    });
  }, [videoTransport, liveKitLocalStream]);

  const localStreamOut =
    videoTransport === "livekit"
      ? liveKitLocalStream ?? localStream
      : localStream;

  const localScreenOut =
    videoTransport === "livekit" ? liveKitLocalScreen : localScreenStream;

  const remoteStreamOut =
    videoTransport === "livekit" ? liveKitRemote : p2pRemote;

  const remoteScreenOut =
    videoTransport === "livekit" ? liveKitRemoteScreen : p2pRemoteScreen;

  const rtcStateOut =
    videoTransport === "livekit" ? liveKitRtcState : p2pRtcState;

  const rtcErrorOut =
    videoTransport === "livekit" ? liveKitRtcError : p2pRtcError;

  const screenSharingOut =
    videoTransport === "livekit" ? liveKitScreenSharing : !!localScreenStream;

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

  const joinCall = useCallback(async () => {
    setMediaError(null);
    if (videoTransport === "livekit") {
      if (!liveKitUrl) {
        setMediaError(
          "LiveKit URL is not configured. Set NEXT_PUBLIC_LIVEKIT_URL.",
        );
        return;
      }
      setPreJoinDone(true);
      setDockMinimized(false);
      return;
    }
    await startPreview();
    setPreJoinDone(true);
    setDockMinimized(false);
  }, [videoTransport, liveKitUrl, startPreview]);

  const stopScreenShare = useCallback(() => {
    if (videoTransport === "livekit") {
      void stopScreenShareLiveKit();
      return;
    }
    localScreenStream?.getTracks().forEach((t) => t.stop());
    setLocalScreenStream(null);
  }, [videoTransport, localScreenStream, stopScreenShareLiveKit]);

  const startScreenShare = useCallback(async () => {
    try {
      if (videoTransport === "livekit") {
        await startScreenShareLiveKit();
        return;
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        stopScreenShare();
      });
      localScreenStream?.getTracks().forEach((t) => t.stop());
      setLocalScreenStream(stream);
    } catch (e) {
      setMediaError(
        e instanceof Error ? e.message : "Could not share screen",
      );
    }
  }, [videoTransport, localScreenStream, startScreenShareLiveKit, stopScreenShare]);

  const toggleAudio = useCallback(() => {
    setAudioOn((a) => {
      const next = !a;
      if (videoTransport === "p2p") {
        localStream?.getAudioTracks().forEach((t) => {
          t.enabled = next;
        });
      }
      return next;
    });
  }, [localStream, videoTransport]);

  const toggleVideo = useCallback(() => {
    setVideoOn((v) => {
      const next = !v;
      if (videoTransport === "p2p") {
        localStream?.getVideoTracks().forEach((t) => {
          t.enabled = next;
        });
      }
      return next;
    });
  }, [localStream, videoTransport]);

  useEffect(() => {
    if (videoTransport !== "p2p") return;
    if (!localStream) return;
    localStream.getAudioTracks().forEach((t) => (t.enabled = audioOn));
    localStream.getVideoTracks().forEach((t) => (t.enabled = videoOn));
  }, [audioOn, videoOn, localStream, videoTransport]);

  const hangUp = useCallback(() => {
    hangUpRtc();
    hangUpLiveKit();
    if (videoTransport === "p2p") {
      localScreenStream?.getTracks().forEach((t) => t.stop());
      setLocalScreenStream(null);
    } else {
      void stopScreenShareLiveKit();
    }
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setPreJoinDone(false);
  }, [
    hangUpRtc,
    hangUpLiveKit,
    stopScreenShareLiveKit,
    localScreenStream,
    localStream,
    videoTransport,
  ]);

  const leaveRoomToDashboard = useCallback(() => {
    hangUp();
    onLeaveNavigate?.();
  }, [hangUp, onLeaveNavigate]);

  const value = useMemo(
    (): RoomMediaContextValue => ({
      localStream: localStreamOut,
      localScreenStream: localScreenOut,
      remoteStream: remoteStreamOut,
      remoteScreenStream: remoteScreenOut,
      callActive,
      preJoinDone,
      audioOn,
      videoOn,
      dockMinimized,
      screenSharing: screenSharingOut,
      rtcState: rtcStateOut,
      rtcError: rtcErrorOut,
      mediaError,
      videoTransport,
      setDockMinimized,
      startPreview,
      joinCall,
      hangUp,
      toggleAudio,
      toggleVideo,
      startScreenShare,
      stopScreenShare,
      leaveRoomToDashboard,
    }),
    [
      localStreamOut,
      localScreenOut,
      remoteStreamOut,
      remoteScreenOut,
      callActive,
      preJoinDone,
      audioOn,
      videoOn,
      dockMinimized,
      screenSharingOut,
      rtcStateOut,
      rtcErrorOut,
      mediaError,
      videoTransport,
      startPreview,
      joinCall,
      hangUp,
      toggleAudio,
      toggleVideo,
      startScreenShare,
      stopScreenShare,
      leaveRoomToDashboard,
    ],
  );

  return (
    <RoomMediaContext.Provider value={value}>{children}</RoomMediaContext.Provider>
  );
}

export function useRoomMedia(): RoomMediaContextValue {
  const ctx = useContext(RoomMediaContext);
  if (!ctx) {
    throw new Error("useRoomMedia must be used within RoomMediaProvider");
  }
  return ctx;
}

export function useRoomMediaOptional(): RoomMediaContextValue | null {
  return useContext(RoomMediaContext);
}
