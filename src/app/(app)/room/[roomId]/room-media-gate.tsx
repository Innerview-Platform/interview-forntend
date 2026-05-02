"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { RoomMediaProvider } from "@/app/(app)/room/[roomId]/room-media-context";
import { siteConfig } from "@/lib/site-config";

export function RoomMediaGate({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <RoomMediaProvider
      onLeaveNavigate={() => router.push(siteConfig.routes.dashboard)}
    >
      {children}
    </RoomMediaProvider>
  );
}
