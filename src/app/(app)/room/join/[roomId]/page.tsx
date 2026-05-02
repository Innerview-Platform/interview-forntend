import { redirect } from "next/navigation";

/** Matches backend `InterviewResponse.roomLink`: `{frontend.url}/room/join/{roomId}` */
export default async function RoomJoinRedirectPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  redirect(`/room/${encodeURIComponent(roomId)}/editor`);
}
