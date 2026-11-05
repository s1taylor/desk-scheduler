import { describe, expect, test } from "vitest";
import { STORAGE_VERSION } from "./constants";
import { parseStoredState, serializeState, type PersistedState } from "./storage";

const STATE: PersistedState = {
  userName: "Alex Kim",
  bookings: [
    { id: "b1", deskId: "A1", date: "2026-11-05", person: "Alex Kim", createdAt: "2026-11-05T09:00:00.000Z" },
  ],
};

describe("parseStoredState", () => {
  test("reports empty storage", () => {
    expect(parseStoredState(null)).toEqual({ kind: "empty" });
  });

  test("round-trips serialized state", () => {
    expect(parseStoredState(serializeState(STATE))).toEqual({ kind: "ok", state: STATE });
  });

  test("rejects malformed JSON", () => {
    expect(parseStoredState("{not json")).toEqual({ kind: "invalid" });
  });

  test("rejects a different storage version", () => {
    const raw = JSON.stringify({ ...STATE, version: STORAGE_VERSION + 1 });

    expect(parseStoredState(raw)).toEqual({ kind: "invalid" });
  });

  test("rejects bookings with missing or malformed fields", () => {
    const raw = JSON.stringify({
      version: STORAGE_VERSION,
      userName: "",
      bookings: [{ id: "b1", deskId: "A1", date: "05/11/2026", person: "Alex", createdAt: "x" }],
    });

    expect(parseStoredState(raw)).toEqual({ kind: "invalid" });
  });

  test("rejects a non-string user name", () => {
    const raw = JSON.stringify({ version: STORAGE_VERSION, userName: 7, bookings: [] });

    expect(parseStoredState(raw)).toEqual({ kind: "invalid" });
  });
});
