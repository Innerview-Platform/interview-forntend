import { RoomSessionProvider } from "./room-session-context";
import { RoomShell } from "./room-shell";

export default async function RoomLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return (
    <RoomSessionProvider roomId={roomId}>
      <RoomShell roomId={roomId}>{children}</RoomShell>
    </RoomSessionProvider>
  );
}
