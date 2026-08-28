"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { getToken, getStoredUser, setToken, setStoredUser } from "/src/lib/auth";
import type { Role } from "/src/components/auth/roles";

export type AuthUser = Record<string, unknown> & { role: Role };

interface AuthSnapshot {
  user: AuthUser | null;
  token: string | null;
}

// Module-level store, not component state: useSyncExternalStore needs a
// snapshot getter that returns a stable reference when nothing changed
// (calling getStoredUser()/getToken() fresh on every render would parse a
// new object each time and look like a change on every render). commit()
// is the only thing that replaces this reference, and only login()/
// logout() call it.
let snapshot: AuthSnapshot = { user: null, token: null };
let hydrated = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getClientSnapshot(): AuthSnapshot {
  if (!hydrated) {
    snapshot = { user: getStoredUser() as AuthUser | null, token: getToken() };
    hydrated = true;
  }
  return snapshot;
}

// Server (and the client's first hydration pass, which React requires to
// match server output) always sees "logged out" — localStorage doesn't
// exist there. Avoids a hydration mismatch instead of reading storage in
// a setState-in-effect after mount. A module-level constant, not a fresh
// object literal per call: useSyncExternalStore requires getServerSnapshot
// to return a stable reference when nothing changed, or React logs
// "getServerSnapshot should be cached" and re-renders in a loop.
const EMPTY_SNAPSHOT: AuthSnapshot = { user: null, token: null };

function getServerSnapshot(): AuthSnapshot {
  return EMPTY_SNAPSHOT;
}

function commit(next: AuthSnapshot): void {
  snapshot = next;
  hydrated = true;
  listeners.forEach((listener) => listener());
}

interface AuthContextValue {
  user: AuthUser | null;
  role: Role | null;
  token: string | null;
  login: (user: Record<string, unknown>, role: Role, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, token } = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const login = useCallback(
    (rawUser: Record<string, unknown>, role: Role, nextToken: string) => {
      const nextUser: AuthUser = { ...rawUser, role };
      setStoredUser(nextUser);
      setToken(nextToken);
      commit({ user: nextUser, token: nextToken });
    },
    [],
  );

  const logout = useCallback(() => {
    setStoredUser(null);
    setToken(null);
    commit({ user: null, token: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, role: user?.role ?? null, token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

export default AuthProvider;
