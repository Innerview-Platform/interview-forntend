"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RoomSignalMessage } from "@/hooks/useSharedEditor";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
];

function parsePayload(msg: RoomSignalMessage): Record<string, unknown> {
  const p = msg.payload;
  if (p && typeof p === "object" && !Array.isArray(p))
    return p as Record<string, unknown>;
  return {};
}

function payloadSession(
  pl: Record<string, unknown>,
): RTCSessionDescriptionInit | null {
  const sdp = typeof pl.sdp === "string" ? pl.sdp : null;
  const raw = pl.type;
  const t = typeof raw === "string" ? raw.toLowerCase() : "";
  if (!sdp || (t !== "offer" && t !== "answer" && t !== "pranswer"))
    return null;
  return { sdp, type: t as RTCSdpType };
}

function payloadIce(
  pl: Record<string, unknown>,
): RTCIceCandidateInit | null {
  const candidate =
    typeof pl.candidate === "string" ? pl.candidate : undefined;
  if (!candidate) return null;
  const init: RTCIceCandidateInit = { candidate };
  if (typeof pl.sdpMid === "string") init.sdpMid = pl.sdpMid;
  if (typeof pl.sdpMLineIndex === "number")
    init.sdpMLineIndex = pl.sdpMLineIndex;
  return init;
}

export type UseRoomWebRtcOptions = {
  roomId: string;
  userId: string;
  wsConnected: boolean;
  /** From STOMP; stable across tab switches when you joined before Video. */
  webrtcSelfRole: "polite" | "impolite" | null;
  addRoomTopicListener: (fn: (msg: RoomSignalMessage) => void) => () => void;
  publishSignaling: (type: string, payload?: unknown) => void;
  localStream: MediaStream | null;
  /** True after user confirms PreJoin (camera/mic). */
  callActive: boolean;
};

export type UseRoomWebRtcReturn = {
  remoteStream: MediaStream | null;
  rtcState: "idle" | "connecting" | "live" | "error";
  rtcError: string | null;
  hangUp: () => void;
};

export function useRoomWebRtc({
  roomId,
  userId,
  wsConnected,
  webrtcSelfRole,
  addRoomTopicListener,
  publishSignaling,
  localStream,
  callActive,
}: UseRoomWebRtcOptions): UseRoomWebRtcReturn {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [rtcState, setRtcState] = useState<
    "idle" | "connecting" | "live" | "error"
  >("idle");
  const [rtcError, setRtcError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const makingOfferRef = useRef(false);
  const ignoreOfferRef = useRef(false);
  const politeRef = useRef(false);

  const roomIdRef = useRef(roomId);
  const userIdRef = useRef(userId);
  const selfRoleRef = useRef(webrtcSelfRole);
  const prevRoomIdRef = useRef<string | null>(null);
  roomIdRef.current = roomId;
  userIdRef.current = userId;
  selfRoleRef.current = webrtcSelfRole;

  const closePeer = useCallback(() => {
    makingOfferRef.current = false;
    ignoreOfferRef.current = false;
    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.onnegotiationneeded = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    setRemoteStream(null);
    setRtcState("idle");
  }, []);

  const hangUp = useCallback(() => {
    closePeer();
  }, [closePeer]);

  const ensurePc = useCallback(
    (stream: MediaStream) => {
      if (pcRef.current) return pcRef.current;
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      politeRef.current = webrtcSelfRole === "polite";

      pc.onicecandidate = (ev) => {
        if (!ev.candidate) return;
        publishSignaling("ICE_CANDIDATE", {
          candidate: ev.candidate.candidate,
          sdpMid: ev.candidate.sdpMid,
          sdpMLineIndex: ev.candidate.sdpMLineIndex,
        });
      };

      pc.ontrack = (ev) => {
        const [rs] = ev.streams;
        if (rs) setRemoteStream(rs);
        setRtcState("live");
      };

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pcRef.current = pc;
      return pc;
    },
    [publishSignaling, webrtcSelfRole],
  );

  useEffect(() => {
    politeRef.current = webrtcSelfRole === "polite";
  }, [webrtcSelfRole]);

  useEffect(() => {
    if (!callActive || !localStream || !wsConnected) {
      closePeer();
      return;
    }

    setRtcState("connecting");
    setRtcError(null);
    const pc = ensurePc(localStream);

    const sendOffer = async () => {
      if (selfRoleRef.current !== "impolite") return;
      try {
        makingOfferRef.current = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        publishSignaling("OFFER", {
          type: pc.localDescription?.type,
          sdp: pc.localDescription?.sdp,
        });
      } catch (e) {
        setRtcError(e instanceof Error ? e.message : "Offer failed");
        setRtcState("error");
      } finally {
        makingOfferRef.current = false;
      }
    };

    const onSignal = async (msg: RoomSignalMessage) => {
      const sidRaw = msg.senderId;
      const fromPeer =
        typeof sidRaw === "string" && sidRaw.length > 0
          ? sidRaw.toLowerCase()
          : "";
      const self = userIdRef.current.toLowerCase();
      if (fromPeer && fromPeer === self) return;

      const rawUnknown = msg as unknown as Record<string, unknown>;
      if (
        rawUnknown.userId &&
        typeof rawUnknown.userId === "string" &&
        !msg.type
      ) {
        closePeer();
        return;
      }

      const t = msg.type;
      if (!t) return;

      if (t === "REQUEST_OFFER") {
        await sendOffer();
        return;
      }

      if (t === "ROLE") {
        const pl = parsePayload(msg);
        const target =
          typeof pl.targetUserId === "string" ? pl.targetUserId : "";
        const role =
          pl.role === "polite" || pl.role === "impolite" ? pl.role : null;
        if (
          target &&
          target.toLowerCase() !== self &&
          role === "polite" &&
          selfRoleRef.current === "impolite"
        ) {
          await sendOffer();
        }
        return;
      }

      if (t === "OFFER") {
        const pl = parsePayload(msg);
        const session = payloadSession(pl);
        if (!session) return;

        const offerCollision =
          session.type === "offer" &&
          (makingOfferRef.current || pc.signalingState !== "stable");

        ignoreOfferRef.current = politeRef.current && offerCollision;
        if (ignoreOfferRef.current) return;

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(session));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          publishSignaling("ANSWER", {
            type: pc.localDescription?.type,
            sdp: pc.localDescription?.sdp,
          });
          setRtcState("live");
        } catch (e) {
          setRtcError(e instanceof Error ? e.message : "Answer failed");
          setRtcState("error");
        }
        return;
      }

      if (t === "ANSWER") {
        const pl = parsePayload(msg);
        const session = payloadSession(pl);
        if (!session) return;
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(session));
          setRtcState("live");
        } catch (e) {
          setRtcError(e instanceof Error ? e.message : "Answer apply failed");
          setRtcState("error");
        }
        return;
      }

      if (t === "ICE_CANDIDATE") {
        const pl = parsePayload(msg);
        const init = payloadIce(pl);
        if (!init) return;
        try {
          await pc.addIceCandidate(new RTCIceCandidate(init));
        } catch {
          /* ignore late candidates */
        }
      }
    };

    const unsub = addRoomTopicListener(onSignal);

    /** Polite peer asks impolite to (re)send an offer — fixes missed ROLE/OFFER when Video joins late. */
    let requestTimer: ReturnType<typeof setTimeout> | undefined;
    if (webrtcSelfRole === "polite") {
      publishSignaling("REQUEST_OFFER", {});
      requestTimer = setTimeout(() => publishSignaling("REQUEST_OFFER", {}), 1200);
    }

    /** Impolite peer bootstraps negotiation if the polite peer joined before Video or OFFER was missed. */
    let bootTimer: ReturnType<typeof setTimeout> | undefined;
    if (webrtcSelfRole === "impolite") {
      bootTimer = setTimeout(() => void sendOffer(), 500);
    }

    return () => {
      unsub();
      if (requestTimer) clearTimeout(requestTimer);
      if (bootTimer) clearTimeout(bootTimer);
    };
  }, [
    callActive,
    localStream,
    wsConnected,
    addRoomTopicListener,
    ensurePc,
    publishSignaling,
    closePeer,
    webrtcSelfRole,
  ]);

  useEffect(() => {
    if (prevRoomIdRef.current !== null && prevRoomIdRef.current !== roomId) {
      closePeer();
    }
    prevRoomIdRef.current = roomId;
  }, [roomId, closePeer]);

  return { remoteStream, rtcState, rtcError, hangUp };
}
