"use client";

import { useState, type ReactNode } from "react";
import { AppShellProvider } from "@/components/app/app-shell-context";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppTopBar } from "@/components/app/AppTopBar";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AppShellProvider>
      <div className="flex min-h-full">
        <AppSidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopBar onMenuOpen={() => setMobileOpen(true)} />
          <div className="flex-1 overflow-x-hidden">{children}</div>
        </div>
      </div>
    </AppShellProvider>
  );
}
