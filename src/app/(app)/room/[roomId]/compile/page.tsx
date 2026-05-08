import { redirect } from "next/navigation";

export default async function RoomCompilePage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  redirect(`/room/${encodeURIComponent(roomId)}/editor`);
}
