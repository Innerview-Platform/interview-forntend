import { redirect } from "next/navigation";

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  redirect(`/room/${encodeURIComponent(roomId)}/editor`);
}
