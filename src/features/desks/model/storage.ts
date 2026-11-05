import { STORAGE_KEY, STORAGE_VERSION } from "./constants";
import { isIsoDate } from "./dates";
import type { Booking } from "./types";

/** Browser-only persistence. There is no database: everything lives in localStorage. */

export interface PersistedState {
  readonly bookings: readonly Booking[];
  readonly userName: string;
}

export type ParsedState =
  | { readonly kind: "empty" }
  | { readonly kind: "ok"; readonly state: PersistedState }
  | { readonly kind: "invalid" };

export type StorageReadResult = ParsedState | { readonly kind: "unavailable" };

const INVALID: ParsedState = { kind: "invalid" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export function isBooking(value: unknown): value is Booking {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.deskId) &&
    isNonEmptyString(value.person) &&
    isNonEmptyString(value.createdAt) &&
    isIsoDate(value.date)
  );
}

function parseJson(raw: string): { ok: true; data: unknown } | { ok: false } {
  try {
    return { ok: true, data: JSON.parse(raw) };
  } catch {
    return { ok: false };
  }
}

/** Validates untrusted stored JSON. Any malformed entry marks the whole payload invalid. */
export function parseStoredState(raw: string | null): ParsedState {
  if (raw === null) return { kind: "empty" };

  const parsed = parseJson(raw);
  if (!parsed.ok || !isRecord(parsed.data) || parsed.data.version !== STORAGE_VERSION) return INVALID;

  const { bookings, userName } = parsed.data;
  if (!Array.isArray(bookings) || !bookings.every(isBooking) || typeof userName !== "string") return INVALID;

  return { kind: "ok", state: { bookings, userName } };
}

export function serializeState(state: PersistedState): string {
  return JSON.stringify({ version: STORAGE_VERSION, bookings: state.bookings, userName: state.userName });
}

export function readStoredState(): StorageReadResult {
  try {
    return parseStoredState(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return { kind: "unavailable" };
  }
}

/** Returns false when the browser refuses the write (private mode, quota exceeded, disabled storage). */
export function writeStoredState(state: PersistedState): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeState(state));
    return true;
  } catch {
    return false;
  }
}
