"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import * as Y from "yjs";
import { getWsOrigin } from "@/lib/api-config";
import type { CompileResultPayload } from "@/lib/compile-result";

export type LogEntry = {
  msg: string;
  type: "info" | "ok" | "err" | "warn" | "muted";
};

export type CompileOptions = {
  language?: string;
  version?: string;
};

export type RoomSignalMessage = {
  type?: string;
  roomId?: string;
  senderId?: string;
  payload?: unknown;
};

export type RemoteCursorState = {
  userId: string;
  line: number;
  column: number;
  name?: string;
};

export type UseSharedEditorReturn = {
  wsState: "off" | "connecting" | "connected";
  editorState: "off" | "joining" | "on";
  code: string;
  logs: LogEntry[];
  version: number;
  compileResult: CompileResultPayload | null;
  compileBusy: boolean;
  /** Last ROLE signal from the server for this user (`polite` / `impolite`). Used by WebRTC after tab switches. */
  webrtcSelfRole: "polite" | "impolite" | null;
  connect: () => void;
  disconnect: () => void;
  handleLocalChange: (newText: string) => void;
  compileCode: (opts?: CompileOptions) => void;
  clearCompileResult: () => void;
  clearLogs: () => void;
  /** Subscribe to `/topic/room/{roomId}` (ROLE, OFFER, ICE, etc.). Call only after connected. */
  addRoomTopicListener: (fn: (msg: RoomSignalMessage) => void) => () => void;
  /** Subscribe to `/topic/room/{roomId}/cursors`. */
  addCursorListener: (fn: (msg: RemoteCursorState) => void) => () => void;
  publishSignaling: (type: string, payload?: unknown) => void;
  /** Shared Y.Text for Monaco `MonacoBinding`; null until STOMP connected and Yjs initialized. */
  getSharedYText: () => Y.Text | null;
};

function computeDelta(
  oldText: string,
  newText: string,
): { index: number; deletions: number; inserted: string } {
  let prefixLen = 0;
  const minLen = Math.min(oldText.length, newText.length);
  while (prefixLen < minLen && oldText[prefixLen] === newText[prefixLen]) {
    prefixLen++;
  }
  let oldSuffix = oldText.length;
  let newSuffix = newText.length;
  while (
    oldSuffix > prefixLen &&
    newSuffix > prefixLen &&
    oldText[oldSuffix - 1] === newText[newSuffix - 1]
  ) {
    oldSuffix--;
    newSuffix--;
  }
  return {
    index: prefixLen,
    deletions: oldSuffix - prefixLen,
    inserted: newText.substring(prefixLen, newSuffix),
  };
}

function uint8ToBase64(bytes: Uint8Array): string {
  const chunk = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

type Options = {
  token: string;
  roomId: string;
  userId: string;
};

export function useSharedEditor({
  token,
  roomId,
  userId,
}: Options): UseSharedEditorReturn {
  const [wsState, setWsState] = useState<
    "off" | "connecting" | "connected"
  >("off");
  const [editorState, setEditorState] = useState<"off" | "joining" | "on">(
    "off",
  );
  const [code, setCode] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [version, setVersion] = useState(0);
  const [compileResult, setCompileResult] =
    useState<CompileResultPayload | null>(null);
  const [compileBusy, setCompileBusy] = useState(false);
  const [webrtcSelfRole, setWebrtcSelfRole] = useState<
    "polite" | "impolite" | null
  >(null);

  const stompRef = useRef<Client | null>(null);
  const roomTopicListenersRef = useRef(new Set<(msg: RoomSignalMessage) => void>());
  const cursorListenersRef = useRef(new Set<(msg: RemoteCursorState) => void>());
  const ydocRef = useRef<Y.Doc | null>(null);
  const ytextRef = useRef<Y.Text | null>(null);
  const isApplyingRemote = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTextRef = useRef<string>("");
  const roomIdRef = useRef(roomId);
  const userIdRef = useRef(userId);

  roomIdRef.current = roomId;
  userIdRef.current = userId;

  const log = useCallback((msg: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [...prev.slice(-199), { msg, type }]);
  }, []);

  const publishCodeUpdate = useCallback(() => {
    const client = stompRef.current;
    const doc = ydocRef.current;
    const text = ytextRef.current;
    if (!client?.connected || !doc || !text) return;
    const update = Y.encodeStateAsUpdate(doc);
    const base64Vector = uint8ToBase64(update);
    const plainText = text.toString();
    const payload = { base64Vector, plainText };
    client.publish({
      destination: "/app/signal.send",
      body: JSON.stringify({
        type: "CODE_UPDATE",
        roomId: roomIdRef.current,
        senderId: userIdRef.current,
        payload,
      }),
    });
    setVersion((v) => v + 1);
  }, []);

  const initYjs = useCallback(
    (initialText = "") => {
      if (ydocRef.current) {
        ydocRef.current.destroy();
        ydocRef.current = null;
        ytextRef.current = null;
      }
      const doc = new Y.Doc();
      const text = doc.getText("sharedCode");
      if (initialText) {
        doc.transact(() => text.insert(0, initialText));
        prevTextRef.current = initialText;
      } else {
        prevTextRef.current = "";
      }

      text.observe(() => {
        if (isApplyingRemote.current) return;
        const full = text.toString();
        setCode(full);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => publishCodeUpdate(), 300);
      });

      ydocRef.current = doc;
      ytextRef.current = text;
      log("Yjs CRDT initialized", "ok");
    },
    [log, publishCodeUpdate],
  );

  const applyRemoteCode = useCallback(
    (payload: { base64Vector?: string; plainText?: string }) => {
      setEditorState("on");
      const doc = ydocRef.current;
      const text = ytextRef.current;
      if (!doc || !text) return;

      isApplyingRemote.current = true;
      try {
        const vec = payload.base64Vector ?? "";
        if (vec.length > 2) {
          try {
            const binary = atob(vec);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++)
              bytes[i] = binary.charCodeAt(i);
            Y.applyUpdate(doc, bytes);
            const merged = text.toString();
            setCode(merged);
            prevTextRef.current = merged;
            log(`CRDT merged (${bytes.length} bytes)`, "ok");
          } catch {
            doc.transact(() => {
              text.delete(0, text.length);
              text.insert(0, payload.plainText ?? "");
            });
            setCode(payload.plainText ?? "");
            prevTextRef.current = payload.plainText ?? "";
            log("Applied plainText fallback", "warn");
          }
        } else {
          const pt = payload.plainText ?? "";
          doc.transact(() => {
            text.delete(0, text.length);
            text.insert(0, pt);
          });
          setCode(pt);
          prevTextRef.current = pt;
        }
      } finally {
        isApplyingRemote.current = false;
      }
      setVersion((v) => v + 1);
    },
    [log],
  );

  const handleLocalChange = useCallback((newText: string) => {
    const doc = ydocRef.current;
    const text = ytextRef.current;
    if (!doc || !text) {
      setCode(newText);
      prevTextRef.current = newText;
      return;
    }
    if (isApplyingRemote.current) return;
    const oldText = prevTextRef.current;
    if (oldText === newText) return;
    const { index, deletions, inserted } = computeDelta(oldText, newText);
    doc.transact(() => {
      if (deletions > 0) text.delete(index, deletions);
      if (inserted.length > 0) text.insert(index, inserted);
    });
    prevTextRef.current = newText;
  }, []);

  const connect = useCallback(() => {
    if (stompRef.current) {
      stompRef.current.deactivate();
      stompRef.current = null;
    }
    setWsState("connecting");
    setCompileResult(null);
    initYjs("");

    const wsOrigin = getWsOrigin();
    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${wsOrigin}/ws-signal`) as unknown as WebSocket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        roomId,
      },
      reconnectDelay: 0,
      onConnect: () => {
        log("STOMP connected", "ok");
        setWsState("connected");
        setEditorState("joining");

        client.subscribe(`/topic/room/${roomId}/code`, (msg) => {
          try {
            const p = JSON.parse(msg.body) as {
              base64Vector?: string;
              plainText?: string;
            };
            applyRemoteCode(p);
          } catch (e) {
            log(
              `Bad CODE message: ${e instanceof Error ? e.message : "parse error"}`,
              "err",
            );
          }
        });

        client.subscribe(`/topic/room/${roomId}/ui-available`, (msg) => {
          log(`UI feature available: ${msg.body}`, "ok");
          if (msg.body === "SHARED_EDITOR") setEditorState("on");
        });

        client.subscribe(`/topic/room/${roomId}/compile-result`, (msg) => {
          try {
            const p = JSON.parse(msg.body) as CompileResultPayload;
            setCompileResult(p);
            setCompileBusy(false);
            log("Compile result received", "ok");
          } catch (e) {
            setCompileBusy(false);
            log(
              `Bad compile-result: ${e instanceof Error ? e.message : "parse"}`,
              "err",
            );
          }
        });

        client.subscribe(`/topic/room/${roomId}`, (msg) => {
          try {
            const raw = JSON.parse(msg.body) as RoomSignalMessage;
            if (raw.type === "ROLE" && raw.payload && typeof raw.payload === "object") {
              const pl = raw.payload as Record<string, unknown>;
              const tid =
                typeof pl.targetUserId === "string" ? pl.targetUserId : "";
              const r = pl.role;
              if (
                tid &&
                tid.toLowerCase() === userIdRef.current.toLowerCase() &&
                (r === "polite" || r === "impolite")
              ) {
                setWebrtcSelfRole(r);
              }
            }
            roomTopicListenersRef.current.forEach((fn) => fn(raw));
          } catch (e) {
            log(
              `Bad room topic message: ${e instanceof Error ? e.message : "parse"}`,
              "err",
            );
          }
        });

        client.subscribe(`/topic/room/${roomId}/cursors`, (msg) => {
          try {
            const raw = JSON.parse(msg.body) as RemoteCursorState;
            if (raw.userId)
              cursorListenersRef.current.forEach((fn) => fn(raw));
          } catch (e) {
            log(
              `Bad cursor message: ${e instanceof Error ? e.message : "parse"}`,
              "err",
            );
          }
        });

        client.publish({
          destination: "/app/signal.send",
          body: JSON.stringify({
            type: "JOIN",
            roomId,
            senderId: userId,
            payload: {},
          }),
        });

        client.publish({
          destination: "/app/signal.send",
          body: JSON.stringify({
            type: "JOIN_FEATURE",
            roomId,
            senderId: userId,
            payload: { element: "SHARED_EDITOR" },
          }),
        });
        log("→ JOIN + JOIN_FEATURE sent", "muted");
      },
      onStompError: (frame) => {
        log(`STOMP error: ${frame.headers?.message || frame.body}`, "err");
        setWsState("off");
        setCompileBusy(false);
      },
      onDisconnect: () => {
        log("STOMP disconnected", "warn");
        setWsState("off");
        setEditorState("off");
        setCompileBusy(false);
      },
      onWebSocketClose: () => {
        setWsState("off");
        setCompileBusy(false);
      },
    });

    client.activate();
    stompRef.current = client;
  }, [token, roomId, userId, initYjs, log, applyRemoteCode]);

  const disconnect = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    stompRef.current?.deactivate();
    stompRef.current = null;
    if (ydocRef.current) {
      ydocRef.current.destroy();
      ydocRef.current = null;
      ytextRef.current = null;
    }
    setWsState("off");
    setEditorState("off");
    setCompileBusy(false);
    setWebrtcSelfRole(null);
  }, []);

  const compileCode = useCallback(
    (opts?: CompileOptions) => {
      const client = stompRef.current;
      const doc = ydocRef.current;
      const text = ytextRef.current;
      if (!client?.connected || !doc || !text) return;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      const update = Y.encodeStateAsUpdate(doc);
      const base64Vector = uint8ToBase64(update);
      const plainText = text.toString();

      const payload: Record<string, string | undefined> = {
        base64Vector,
        plainText,
      };
      if (opts?.language) payload.language = opts.language;
      if (opts?.version) payload.version = opts.version;

      setCompileBusy(true);
      client.publish({
        destination: "/app/signal.send",
        body: JSON.stringify({
          type: "COMPILE_CODE",
          roomId: roomIdRef.current,
          senderId: userIdRef.current,
          payload,
        }),
      });
      log("→ COMPILE_CODE sent", "info");
    },
    [log],
  );

  const clearCompileResult = useCallback(() => setCompileResult(null), []);

  const clearLogs = useCallback(() => setLogs([]), []);

  const addRoomTopicListener = useCallback(
    (fn: (msg: RoomSignalMessage) => void) => {
      roomTopicListenersRef.current.add(fn);
      return () => {
        roomTopicListenersRef.current.delete(fn);
      };
    },
    [],
  );

  const addCursorListener = useCallback(
    (fn: (msg: RemoteCursorState) => void) => {
      cursorListenersRef.current.add(fn);
      return () => {
        cursorListenersRef.current.delete(fn);
      };
    },
    [],
  );

  const publishSignaling = useCallback((type: string, payload?: unknown) => {
    const client = stompRef.current;
    if (!client?.connected) return;
    client.publish({
      destination: "/app/signal.send",
      body: JSON.stringify({
        type,
        roomId: roomIdRef.current,
        senderId: userIdRef.current,
        payload: payload ?? {},
      }),
    });
  }, []);

  const getSharedYText = useCallback((): Y.Text | null => {
    return ytextRef.current;
  }, []);

  useEffect(() => () => disconnect(), [disconnect]);

  return {
    wsState,
    editorState,
    code,
    logs,
    version,
    compileResult,
    compileBusy,
    webrtcSelfRole,
    connect,
    disconnect,
    handleLocalChange,
    compileCode,
    clearCompileResult,
    clearLogs,
    addRoomTopicListener,
    addCursorListener,
    publishSignaling,
    getSharedYText,
  };
}
