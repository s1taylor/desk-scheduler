import { useSyncExternalStore } from "react";
import { STORAGE_KEY } from "./constants";
import { todayIso } from "./dates";
import { createDemoBookings } from "./demo-data";
import { DESKS } from "./office-layout";
import { readStoredState, writeStoredState, type PersistedState } from "./storage";
import type { Booking } from "./types";

/**
 * A tiny external store backed by localStorage. React reads it through
 * useSyncExternalStore, and other open tabs stay in sync via the `storage` event.
 */

export interface BookingStoreState extends PersistedState {
  readonly storageError: string | null;
}

const MESSAGES = {
  invalid: "Your saved bookings couldn't be read, so the schedule was reset to demo data.",
  unavailable: "Browser storage is unavailable, so bookings will be lost when you close this page.",
  saveFailed: "Your last change couldn't be saved to browser storage.",
} as const;

const SERVER_STATE: BookingStoreState = { bookings: [], userName: "", storageError: null };
const listeners = new Set<() => void>();
let snapshot: BookingStoreState | null = null;

function demoState(storageError: string | null): BookingStoreState {
  return { bookings: createDemoBookings(todayIso(), DESKS), userName: "", storageError };
}

function loadState(): BookingStoreState {
  const result = readStoredState();
  switch (result.kind) {
    case "ok":
      return { ...result.state, storageError: null };
    case "empty":
      return demoState(null);
    case "invalid":
      return demoState(MESSAGES.invalid);
    case "unavailable":
      return demoState(MESSAGES.unavailable);
  }
}

function getSnapshot(): BookingStoreState {
  if (snapshot === null) snapshot = loadState();
  return snapshot;
}

function getServerSnapshot(): BookingStoreState {
  return SERVER_STATE;
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

function handleStorageEvent(event: StorageEvent): void {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  snapshot = null;
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", handleStorageEvent);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", handleStorageEvent);
  };
}

function commit(next: PersistedState): void {
  const isSaved = writeStoredState(next);
  snapshot = { ...next, storageError: isSaved ? null : MESSAGES.saveFailed };
  emit();
}

export const bookingStore = {
  setBookings(bookings: readonly Booking[]): void {
    commit({ bookings, userName: getSnapshot().userName });
  },
  setUserName(userName: string): void {
    commit({ bookings: getSnapshot().bookings, userName });
  },
  resetDemoData(): void {
    commit({ bookings: createDemoBookings(todayIso(), DESKS), userName: getSnapshot().userName });
  },
  dismissStorageError(): void {
    snapshot = { ...getSnapshot(), storageError: null };
    emit();
  },
} as const;

export function useBookingStore(): BookingStoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
