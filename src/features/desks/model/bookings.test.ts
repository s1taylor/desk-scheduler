import { describe, expect, test } from "vitest";
import {
  bookDesk,
  cancelBooking,
  countAvailable,
  getDeskStatus,
  getDeskStatuses,
  moveBooking,
  normalizeName,
  upcomingBookingsFor,
  type BookingContext,
} from "./bookings";
import { BOOKING_WINDOW_DAYS, MAX_NAME_LENGTH } from "./constants";
import { addDays } from "./dates";
import type { Booking, Desk } from "./types";

const TODAY = "2026-11-05"; // a Thursday

function makeDesk(id: string): Desk {
  return {
    id,
    label: id,
    zone: "window",
    kind: "sitting",
    monitors: 1,
    x: 0,
    z: 0,
    rotation: 0,
    features: [],
  };
}

const DESKS: readonly Desk[] = [makeDesk("A1"), makeDesk("A2"), makeDesk("A3")];
const CONTEXT: BookingContext = { today: TODAY, desks: DESKS };

function booking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "b1",
    deskId: "A1",
    date: TODAY,
    person: "Alex Kim",
    createdAt: "2026-11-05T09:00:00.000Z",
    ...overrides,
  };
}

function expectError(result: ReturnType<typeof bookDesk>, pattern: RegExp) {
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.error).toMatch(pattern);
}

describe("normalizeName", () => {
  test("trims and collapses internal whitespace", () => {
    expect(normalizeName("  Alex   Kim \t")).toBe("Alex Kim");
  });
});

describe("bookDesk", () => {
  test("adds a booking for an available desk", () => {
    const result = bookDesk([], booking(), CONTEXT);

    expect(result).toEqual({ ok: true, value: [booking()] });
  });

  test("does not mutate the existing bookings", () => {
    const existing = Object.freeze([booking({ id: "b0", deskId: "A2", person: "Sam Rivera" })]);

    const result = bookDesk(existing, booking(), CONTEXT);

    expect(existing).toHaveLength(1);
    expect(result.ok && result.value).toHaveLength(2);
  });

  test("stores the person name with normalized whitespace", () => {
    const result = bookDesk([], booking({ person: "  Alex   Kim " }), CONTEXT);

    expect(result.ok && result.value[0].person).toBe("Alex Kim");
  });

  test("rejects an empty name", () => {
    expectError(bookDesk([], booking({ person: "   " }), CONTEXT), /enter your name/i);
  });

  test("rejects names longer than the limit", () => {
    const person = "x".repeat(MAX_NAME_LENGTH + 1);

    expectError(bookDesk([], booking({ person }), CONTEXT), /characters or fewer/);
  });

  test("rejects an invalid date", () => {
    expectError(bookDesk([], booking({ date: "2026-02-30" }), CONTEXT), /valid date/);
  });

  test("rejects dates in the past", () => {
    expectError(bookDesk([], booking({ date: "2026-11-04" }), CONTEXT), /past/);
  });

  test("rejects dates beyond the booking window", () => {
    const date = addDays(TODAY, BOOKING_WINDOW_DAYS + 1);

    expectError(bookDesk([], booking({ date }), CONTEXT), /days ahead/);
  });

  test("accepts the last day of the booking window", () => {
    const date = addDays(TODAY, BOOKING_WINDOW_DAYS);

    expect(bookDesk([], booking({ date }), CONTEXT).ok).toBe(true);
  });

  test("rejects weekends", () => {
    expectError(bookDesk([], booking({ date: "2026-11-07" }), CONTEXT), /weekends/);
  });

  test("rejects unknown desks", () => {
    expectError(bookDesk([], booking({ deskId: "Z9" }), CONTEXT), /doesn't exist/);
  });

  test("rejects a desk someone else has booked that day", () => {
    const existing = [booking({ id: "b0", person: "Sam Rivera" })];

    expectError(bookDesk(existing, booking(), CONTEXT), /already booked by Sam Rivera/);
  });

  test("tells the person when they already hold that desk", () => {
    const existing = [booking({ id: "b0" })];

    expectError(bookDesk(existing, booking(), CONTEXT), /already booked A1/);
  });

  test("allows the same desk on a different day", () => {
    const existing = [booking({ id: "b0", person: "Sam Rivera" })];

    const result = bookDesk(existing, booking({ date: "2026-11-06" }), CONTEXT);

    expect(result.ok).toBe(true);
  });

  test("rejects a second desk for the same person on the same day, ignoring case", () => {
    const existing = [booking({ id: "b0", deskId: "A2", person: "alex KIM" })];

    expectError(bookDesk(existing, booking(), CONTEXT), /already have A2/);
  });
});

describe("cancelBooking", () => {
  test("removes the booking when the requester owns it", () => {
    const existing = [booking(), booking({ id: "b2", deskId: "A2", person: "Sam Rivera" })];

    const result = cancelBooking(existing, "b1", "Alex Kim");

    expect(result.ok && result.value.map((b) => b.id)).toEqual(["b2"]);
  });

  test("matches the owner case-insensitively", () => {
    expect(cancelBooking([booking()], "b1", " alex kim ").ok).toBe(true);
  });

  test("refuses to cancel someone else's booking", () => {
    const result = cancelBooking([booking()], "b1", "Sam Rivera");

    expectError(result, /only cancel your own/);
  });

  test("reports a booking that no longer exists", () => {
    expectError(cancelBooking([], "missing", "Alex Kim"), /no longer exists/);
  });
});

describe("moveBooking", () => {
  test("replaces the existing booking with the new desk", () => {
    const existing = [booking()];

    const result = moveBooking(existing, "b1", booking({ id: "b2", deskId: "A2" }), CONTEXT);

    expect(result.ok && result.value).toEqual([booking({ id: "b2", deskId: "A2" })]);
  });

  test("fails without changes when the target desk is taken", () => {
    const existing = [booking(), booking({ id: "b2", deskId: "A2", person: "Sam Rivera" })];

    const result = moveBooking(existing, "b1", booking({ id: "b3", deskId: "A2" }), CONTEXT);

    expectError(result, /already booked by Sam Rivera/);
    expect(existing).toHaveLength(2);
  });
});

describe("desk status", () => {
  const existing = [
    booking({ id: "b1", deskId: "A1", person: "Alex Kim" }),
    booking({ id: "b2", deskId: "A2", person: "Sam Rivera" }),
  ];

  test("marks desks as available, booked or mine for the selected date", () => {
    expect(getDeskStatuses(existing, DESKS, TODAY, "alex kim")).toEqual({
      A1: "mine",
      A2: "booked",
      A3: "available",
    });
  });

  test("treats every booked desk as booked when no user name is set", () => {
    expect(getDeskStatus(existing, "A1", TODAY, "")).toBe("booked");
  });

  test("ignores bookings on other dates", () => {
    expect(getDeskStatus(existing, "A1", "2026-11-06", "Alex Kim")).toBe("available");
  });

  test("counts desks without a booking on the date", () => {
    expect(countAvailable(existing, DESKS, TODAY)).toBe(1);
    expect(countAvailable(existing, DESKS, "2026-11-06")).toBe(3);
  });
});

describe("upcomingBookingsFor", () => {
  const existing = [
    booking({ id: "past", date: "2026-11-04" }),
    booking({ id: "later", date: "2026-11-10" }),
    booking({ id: "today", date: TODAY }),
    booking({ id: "other", date: "2026-11-06", person: "Sam Rivera" }),
  ];

  test("returns the person's bookings from today onward, sorted by date", () => {
    const result = upcomingBookingsFor(existing, "Alex Kim", TODAY);

    expect(result.map((b) => b.id)).toEqual(["today", "later"]);
  });

  test("returns nothing when no name is set", () => {
    expect(upcomingBookingsFor(existing, "  ", TODAY)).toEqual([]);
  });
});
