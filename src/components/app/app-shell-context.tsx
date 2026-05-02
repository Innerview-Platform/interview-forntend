"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AppShellContextValue = {
  headerAvatarUrl: string | null;
  setHeaderAvatarUrl: (url: string | null) => void;
};

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [headerAvatarUrl, setHeaderAvatarUrlState] = useState<string | null>(
    null,
  );

  const setHeaderAvatarUrl = useCallback((url: string | null) => {
    setHeaderAvatarUrlState(url);
  }, []);

  const value = useMemo(
    () => ({ headerAvatarUrl, setHeaderAvatarUrl }),
    [headerAvatarUrl, setHeaderAvatarUrl],
  );

  return (
    <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>
  );
}

export function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error("useAppShell must be used within AppShellProvider");
  }
  return ctx;
}
