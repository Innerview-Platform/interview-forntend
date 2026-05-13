import { RoomSubmissionsPanel } from "@/components/room/RoomSubmissionsPanel";

export default function RoomSubmissionsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-1">
      <h1 className="text-lg font-semibold text-foreground">Submissions</h1>
      <RoomSubmissionsPanel />
    </div>
  );
}
