import { describe, expect, test } from "vitest";
import {
  addDays,
  daysBetween,
  formatDateParts,
  formatLongDate,
  formatShortDate,
  isIsoDate,
  isWeekend,
  toIsoDate,
  upcomingWeekdays,
} from "./dates";

describe("toIsoDate", () => {
  test("formats a local date as YYYY-MM-DD with zero padding", () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("isIsoDate", () => {
  test("accepts real calendar dates", () => {
    expect(isIsoDate("2026-11-05")).toBe(true);
    expect(isIsoDate("2028-02-29")).toBe(true);
  });

  test.each(["2026-13-01", "2026-02-30", "11/05/2026", "", "2026-1-5"])(
    "rejects malformed or impossible date %j",
    (value) => {
      expect(isIsoDate(value)).toBe(false);
    },
  );

  test("rejects non-string values", () => {
    expect(isIsoDate(42)).toBe(false);
    expect(isIsoDate(null)).toBe(false);
    expect(isIsoDate(undefined)).toBe(false);
  });
});

describe("addDays", () => {
  test("rolls over month and year boundaries", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
  });

  test("subtracts days when given a negative value", () => {
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  test("throws when given an invalid date", () => {
    expect(() => addDays("not-a-date", 1)).toThrow(/Invalid ISO date/);
  });
});

describe("daysBetween", () => {
  test("counts whole calendar days across a daylight saving change", () => {
    expect(daysBetween("2026-03-07", "2026-03-09")).toBe(2);
  });

  test("returns a negative number when the target is earlier", () => {
    expect(daysBetween("2026-11-05", "2026-11-01")).toBe(-4);
  });
});

describe("isWeekend", () => {
  test("identifies Saturdays and Sundays", () => {
    expect(isWeekend("2026-11-07")).toBe(true);
    expect(isWeekend("2026-11-08")).toBe(true);
  });

  test("treats weekdays as working days", () => {
    expect(isWeekend("2026-11-06")).toBe(false);
  });
});

describe("upcomingWeekdays", () => {
  test("starts from the given date and skips weekends", () => {
    expect(upcomingWeekdays("2026-11-05", 4)).toEqual([
      "2026-11-05",
      "2026-11-06",
      "2026-11-09",
      "2026-11-10",
    ]);
  });

  test("starts on the following Monday when given a weekend", () => {
    expect(upcomingWeekdays("2026-11-07", 1)).toEqual(["2026-11-09"]);
  });

  test("returns an empty list when asked for zero days", () => {
    expect(upcomingWeekdays("2026-11-05", 0)).toEqual([]);
  });
});

describe("date formatting", () => {
  test("formats a short label with weekday, month and day", () => {
    expect(formatShortDate("2026-11-05")).toBe("Thu, Nov 5");
  });

  test("formats a long label", () => {
    expect(formatLongDate("2026-11-05")).toBe("Thursday, November 5");
  });

  test("splits a date into display parts", () => {
    expect(formatDateParts("2026-11-05")).toEqual({
      weekday: "Thu",
      day: "5",
      month: "Nov",
    });
  });
});
