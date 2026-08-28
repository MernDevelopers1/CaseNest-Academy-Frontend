"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

// SSR-safe "has this component finished its first client render" check,
// without a setState-in-effect (which the react-hooks lint rule flags).
// Server and the client's first hydration pass both see `false`, matching
// React's requirement that they render identically; only a later re-render
// picks up `true`.
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
