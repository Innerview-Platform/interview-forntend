import { Suspense } from "react";
import { ProfileView } from "./profile-view";

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted">
          Loading profile…
        </div>
      }
    >
      <ProfileView />
    </Suspense>
  );
}
