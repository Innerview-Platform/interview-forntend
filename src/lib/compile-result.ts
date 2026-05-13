/** Mirrors backend `CompileResultPayload` JSON over STOMP `/topic/room/{roomId}/compile-result`. */
export type CompileResultPayload = {
  roomId: string;
  requestedByUserId?: string;
  ok: boolean;
  pistonReachable: boolean;
  errorMessage?: string | null;
  stdout?: string | null;
  stderr?: string | null;
  exitCode?: number | null;
  language?: string | null;
  version?: string | null;
  rawResponsePreview?: string | null;
};
