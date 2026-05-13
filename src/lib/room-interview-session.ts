/** Session-scoped interview id for this room; set from creation or room lookup. */
export function interviewSessionStorageKey(roomId: string): string {
  return `innerview_interview_id_for_room:${roomId}`;
}

export function readStoredInterviewIdForRoom(roomId: string): number | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(interviewSessionStorageKey(roomId))?.trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

export function writeStoredInterviewIdForRoom(
  roomId: string,
  interviewId: number,
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    interviewSessionStorageKey(roomId),
    String(interviewId),
  );
}
