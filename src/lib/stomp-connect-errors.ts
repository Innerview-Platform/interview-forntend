/**
 * Maps STOMP CONNECT / broker errors to copy aligned with
 * `InterviewSessionExceptionHandler` and `RoomServiceImpl.joinRoom` messages.
 */
export function mapStompConnectFailureMessage(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("full") || s.includes("room is full")) {
    return "This room is full. You cannot join right now.";
  }
  if (
    s.includes("not ready") ||
    s.includes("schedule") ||
    s.includes("has not begun")
  ) {
    return "This interview is not open yet. Check the scheduled start time.";
  }
  if (
    s.includes("expired") ||
    s.includes("completed") ||
    s.includes("cancelled") ||
    s.includes("gone")
  ) {
    return "This interview has ended or was cancelled.";
  }
  if (s.includes("not found") || s.includes("room with id")) {
    return "Room not found or no longer available.";
  }
  if (s.includes("unauthorized") || s.includes("invalid token")) {
    return "Could not connect: sign in again or check your link.";
  }
  return raw.trim() || "Could not connect to the interview room.";
}
