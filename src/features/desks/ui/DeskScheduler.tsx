"use client";

import { SchedulerApp } from "./SchedulerApp";
import { useIsClient } from "./use-is-client";

/**
 * Entry point. The scheduler depends on the viewer's local date and on
 * localStorage, so it renders only in the browser to avoid hydration mismatches.
 */
export function DeskScheduler() {
  const isClient = useIsClient();
  if (!isClient) {
    return <div className="grid min-h-dvh place-items-center bg-slate-100 text-sm text-slate-500">Loading office…</div>;
  }
  return <SchedulerApp />;
}
