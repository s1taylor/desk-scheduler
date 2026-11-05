import { describe, expect, test } from "vitest";
import { bookDesk, countAvailable, type BookingContext } from "./bookings";
import { ROOM } from "./constants";
import { createDemoBookings } from "./demo-data";
import { createId } from "./ids";
import { DESKS, ZONES, getDesk, getZone } from "./office-layout";
import type { Booking } from "./types";

const TODAY = "2026-11-05";
const CONTEXT: BookingContext = { today: TODAY, desks: DESKS };

describe("office layout", () => {
  test("gives every desk a unique id", () => {
    const ids = DESKS.map((desk) => desk.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  test("places every desk in a known zone inside the room", () => {
    for (const desk of DESKS) {
      expect(getZone(desk.zone)).toBeDefined();
      expect(Math.abs(desk.x)).toBeLessThan(ROOM.width / 2);
      expect(Math.abs(desk.z)).toBeLessThan(ROOM.depth / 2);
    }
  });

  test("has at least one desk in every zone", () => {
    for (const zone of ZONES) {
      expect(DESKS.some((desk) => desk.zone === zone.id)).toBe(true);
    }
  });

  test("looks desks up by id", () => {
    expect(getDesk("B2")?.zone).toBe("pods");
    expect(getDesk("nope")).toBeUndefined();
  });
});

describe("createDemoBookings", () => {
  const demo = createDemoBookings(TODAY, DESKS);

  test("creates bookings that all pass the booking rules", () => {
    const replay = demo.reduce<readonly Booking[]>((accepted, booking) => {
      const result = bookDesk(accepted, booking, CONTEXT);
      if (!result.ok) throw new Error(`Demo booking rejected: ${result.error}`);
      return result.value;
    }, []);

    expect(replay).toHaveLength(demo.length);
    expect(demo.length).toBeGreaterThan(0);
  });

  test("leaves free desks on every day", () => {
    const dates = new Set(demo.map((booking) => booking.date));

    for (const date of dates) {
      expect(countAvailable(demo, DESKS, date)).toBeGreaterThan(0);
    }
  });

  test("returns nothing when there are no desks", () => {
    expect(createDemoBookings(TODAY, [])).toEqual([]);
  });
});

describe("createId", () => {
  test("returns distinct ids", () => {
    expect(createId()).not.toBe(createId());
  });
});
