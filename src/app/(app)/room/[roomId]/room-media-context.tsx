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
import { useRoomSession } from "@/app/(app)/room/[roomId]/room-session-context";
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

  const { user } = useSyncExternalStore(
    subscribeClientSession,
    getClientSessionSnapshot,
    getServerClientSessionSnapshot,
  );

  const {
    wsState,
    addRoomTopicListener,
    publishSignaling,
    webrtcSelfRole,
  } = useRoomSession();

  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [preJoinDone, setPreJoinDone] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [localScreenStream, setLocalScreenStream] =
    useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [dockMinimized, setDockMinimized] = useState(false);

  const callActive = preJoinDone && !!localStream;

  const {
    remoteStream,
    remoteScreenStream,
    rtcState,
    rtcError,
    hangUp: hangUpRtc,
  } = useRoomWebRtc({
    roomId,
    userId: user?.id ?? "",
    wsConnected: wsState === "connected",
    webrtcSelfRole,
    addRoomTopicListener,
    publishSignaling,
    localStream,
    localScreenStream,
    callActive,
  });

  const screenSharing = !!localScreenStream;

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
    await startPreview();
    setPreJoinDone(true);
    setDockMinimized(false);
  }, [startPreview]);

  const stopScreenShare = useCallback(() => {
    localScreenStream?.getTracks().forEach((t) => t.stop());
    setLocalScreenStream(null);
  }, [localScreenStream]);

  const startScreenShare = useCallback(async () => {
    try {
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
  }, [localScreenStream, stopScreenShare]);

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

  const hangUp = useCallback(() => {
    hangUpRtc();
    stopScreenShare();
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setPreJoinDone(false);
  }, [hangUpRtc, localStream, stopScreenShare]);

  const leaveRoomToDashboard = useCallback(() => {
    hangUp();
    onLeaveNavigate?.();
  }, [hangUp, onLeaveNavigate]);

  const value = useMemo(
    (): RoomMediaContextValue => ({
      localStream,
      localScreenStream,
      remoteStream,
      remoteScreenStream,
      callActive,
      preJoinDone,
      audioOn,
      videoOn,
      dockMinimized,
      screenSharing,
      rtcState,
      rtcError,
      mediaError,
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
      localStream,
      localScreenStream,
      remoteStream,
      remoteScreenStream,
      callActive,
      preJoinDone,
      audioOn,
      videoOn,
      dockMinimized,
      screenSharing,
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
