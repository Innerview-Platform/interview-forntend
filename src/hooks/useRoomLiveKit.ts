"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ConnectionState,
  Room,
  RoomEvent,
  Track,
  type RemoteParticipant,
  type TrackPublication,
} from "livekit-client";
import { fetchLiveKitAccessToken } from "@/lib/video-config";

export type UseRoomLiveKitOptions = {
  enabled: boolean;
  roomName: string;
  userId: string;
  accessToken: string | null;
  liveKitUrl: string;
  callActive: boolean;
  cameraEnabled: boolean;
  micEnabled: boolean;
};

export type UseRoomLiveKitReturn = {
  localStream: MediaStream | null;
  localScreenStream: MediaStream | null;
  remoteStream: MediaStream | null;
  remoteScreenStream: MediaStream | null;
  rtcState: "idle" | "connecting" | "live" | "error";
  rtcError: string | null;
  screenSharing: boolean;
  hangUp: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
};

function mediaTrack(pub: TrackPublication | undefined): MediaStreamTrack | null {
  if (!pub?.track) return null;
  return pub.track.mediaStreamTrack;
}

function firstRemote(room: Room): RemoteParticipant | undefined {
  return room.remoteParticipants.values().next().value;
}

function localCameraMicStream(room: Room): MediaStream | null {
  const lp = room.localParticipant;
  const v = mediaTrack(lp.getTrackPublication(Track.Source.Camera));
  const a = mediaTrack(lp.getTrackPublication(Track.Source.Microphone));
  const tracks = [v, a].filter((t): t is MediaStreamTrack => t != null);
  return tracks.length ? new MediaStream(tracks) : null;
}

function localScreenStream(room: Room): MediaStream | null {
  const t = mediaTrack(
    room.localParticipant.getTrackPublication(Track.Source.ScreenShare),
  );
  return t ? new MediaStream([t]) : null;
}

function remoteCameraMicStream(r: RemoteParticipant): MediaStream | null {
  const v = mediaTrack(r.getTrackPublication(Track.Source.Camera));
  const a = mediaTrack(r.getTrackPublication(Track.Source.Microphone));
  const tracks = [v, a].filter((x): x is MediaStreamTrack => x != null);
  return tracks.length ? new MediaStream(tracks) : null;
}

function remoteScreen(r: RemoteParticipant): MediaStream | null {
  const t = mediaTrack(r.getTrackPublication(Track.Source.ScreenShare));
  return t ? new MediaStream([t]) : null;
}

export function useRoomLiveKit({
  enabled,
  roomName,
  userId,
  accessToken,
  liveKitUrl,
  callActive,
  cameraEnabled,
  micEnabled,
}: UseRoomLiveKitOptions): UseRoomLiveKitReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [localScreenStreamState, setLocalScreenStreamState] =
    useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteScreenStream, setRemoteScreenStream] =
    useState<MediaStream | null>(null);
  const [rtcState, setRtcState] = useState<
    "idle" | "connecting" | "live" | "error"
  >("idle");
  const [rtcError, setRtcError] = useState<string | null>(null);
  const [screenSharing, setScreenSharing] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const mediaRef = useRef({ cameraEnabled, micEnabled });
  mediaRef.current = { cameraEnabled, micEnabled };

  const clearStreams = useCallback(() => {
    setLocalStream(null);
    setLocalScreenStreamState(null);
    setRemoteStream(null);
    setRemoteScreenStream(null);
    setScreenSharing(false);
  }, []);

  const hangUp = useCallback(() => {
    const room = roomRef.current;
    if (room) {
      room.disconnect();
      roomRef.current = null;
    }
    clearStreams();
    setRtcState("idle");
    setRtcError(null);
  }, [clearStreams]);

  useEffect(() => {
    if (
      !enabled ||
      !callActive ||
      !liveKitUrl ||
      !accessToken ||
      !userId ||
      !roomName.trim()
    ) {
      const existing = roomRef.current;
      if (existing) {
        existing.disconnect();
        roomRef.current = null;
      }
      clearStreams();
      setRtcState("idle");
      setRtcError(null);
      return;
    }

    const room = new Room();
    roomRef.current = room;

    const sync = () => {
      setLocalStream(localCameraMicStream(room));
      setLocalScreenStreamState(localScreenStream(room));
      const lpScreenPub = room.localParticipant.getTrackPublication(
        Track.Source.ScreenShare,
      );
      setScreenSharing(!!mediaTrack(lpScreenPub));

      const rem = firstRemote(room);
      if (!rem) {
        setRemoteStream(null);
        setRemoteScreenStream(null);
        return;
      }
      setRemoteStream(remoteCameraMicStream(rem));
      setRemoteScreenStream(remoteScreen(rem));
    };

    room
      .on(RoomEvent.TrackPublished, sync)
      .on(RoomEvent.TrackSubscribed, sync)
      .on(RoomEvent.TrackUnpublished, sync)
      .on(RoomEvent.LocalTrackPublished, sync)
      .on(RoomEvent.ParticipantConnected, sync)
      .on(RoomEvent.ParticipantDisconnected, sync);

    room.on(RoomEvent.Disconnected, () => {
      setRtcState("idle");
      clearStreams();
    });

    let cancelled = false;

    void (async () => {
      try {
        setRtcState("connecting");
        setRtcError(null);
        const jwt = await fetchLiveKitAccessToken({
          roomName,
          participantIdentity: userId,
          bearerToken: accessToken,
        });
        if (cancelled) return;
        await room.connect(liveKitUrl, jwt);
        if (cancelled) return;
        await room.localParticipant.setCameraEnabled(
          mediaRef.current.cameraEnabled,
        );
        await room.localParticipant.setMicrophoneEnabled(
          mediaRef.current.micEnabled,
        );
        sync();
        if (room.state === ConnectionState.Connected) {
          setRtcState("live");
        }
      } catch (e) {
        if (!cancelled) {
          setRtcError(
            e instanceof Error ? e.message : "LiveKit connection failed",
          );
          setRtcState("error");
          try {
            room.disconnect();
          } catch {
            /* ignore */
          }
          roomRef.current = null;
          clearStreams();
        }
      }
    })();

    return () => {
      cancelled = true;
      room.disconnect();
      if (roomRef.current === room) {
        roomRef.current = null;
      }
      clearStreams();
      setRtcState("idle");
      setRtcError(null);
    };
  }, [
    enabled,
    callActive,
    liveKitUrl,
    accessToken,
    userId,
    roomName,
    clearStreams,
  ]);

  useEffect(() => {
    if (!enabled || !callActive) return;
    const room = roomRef.current;
    if (!room || room.state !== ConnectionState.Connected) return;
    void room.localParticipant.setCameraEnabled(cameraEnabled);
  }, [enabled, callActive, cameraEnabled]);

  useEffect(() => {
    if (!enabled || !callActive) return;
    const room = roomRef.current;
    if (!room || room.state !== ConnectionState.Connected) return;
    void room.localParticipant.setMicrophoneEnabled(micEnabled);
  }, [enabled, callActive, micEnabled]);

  const startScreenShare = useCallback(async () => {
    const room = roomRef.current;
    if (!room || room.state !== ConnectionState.Connected) return;
    await room.localParticipant.setScreenShareEnabled(true);
  }, []);

  const stopScreenShare = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    await room.localParticipant.setScreenShareEnabled(false);
  }, []);

  return {
    localStream,
    localScreenStream: localScreenStreamState,
    remoteStream,
    remoteScreenStream,
    rtcState,
    rtcError,
    screenSharing,
    hangUp,
    startScreenShare,
    stopScreenShare,
  };
}
