import {
  getStoredAccessToken,
  getStoredUser,
  INNERVIEW_AUTH_CHANGED_EVENT,
  type StoredUser,
} from "@/lib/auth-api";

export type ClientSession = {
  token: string | null;
  user: StoredUser | null;
};

const SERVER_SNAPSHOT: ClientSession = { token: null, user: null };

let cachedSnapshot: ClientSession = SERVER_SNAPSHOT;
let cachedSignature: string | null = null;

function signatureFor(token: string | null, user: StoredUser | null): string {
  if (!token && !user) return "";
  if (!user) return `${token ?? ""}`;
  return `${token ?? ""}\0${user.id}\0${user.email}`;
}

/**
 * Snapshot for useSyncExternalStore: returns the same object reference until
 * token/user identity changes, so React does not loop (getStoredUser() alone
 * returns a new object every call).
 */
export function getClientSessionSnapshot(): ClientSession {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  const token = getStoredAccessToken();
  const user = getStoredUser();
  const sig = signatureFor(token, user);
  if (sig === cachedSignature) {
    return cachedSnapshot;
  }
  cachedSignature = sig;
  cachedSnapshot = { token, user };
  return cachedSnapshot;
}

export function getServerClientSessionSnapshot(): ClientSession {
  return SERVER_SNAPSHOT;
}

export function subscribeClientSession(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onAuth = () => {
    cachedSignature = null;
    onStoreChange();
  };
  window.addEventListener(INNERVIEW_AUTH_CHANGED_EVENT, onAuth);
  return () => window.removeEventListener(INNERVIEW_AUTH_CHANGED_EVENT, onAuth);
}
