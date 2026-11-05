import { useSyncExternalStore } from "react";

const noopSubscribe = (): (() => void) => () => {};

/** False during server rendering and hydration, true once running in the browser. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
