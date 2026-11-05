import { upcomingWeekdays } from "./dates";
import type { Booking, Desk } from "./types";

/** Synthetic colleagues so the office isn't empty on first load. */
const DEMO_PEOPLE = ["Jordan Lee", "Sam Rivera", "Priya Shah", "Chris Ng", "Morgan Blake", "Riley Cooper"];
const DEMO_DAYS = 5;
const DESK_STRIDE = 3;
const DAY_SHIFT = 2;

function rotate<T>(items: readonly T[], by: number): T[] {
  if (items.length === 0) return [];
  const offset = by % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

/** Builds a deterministic set of bookings over the next few working days. */
export function createDemoBookings(today: string, desks: readonly Desk[]): Booking[] {
  return upcomingWeekdays(today, DEMO_DAYS).flatMap((date, dayIndex) => {
    const desksForDay = rotate(desks, dayIndex * DAY_SHIFT).filter((_, i) => i % DESK_STRIDE === 0);
    const peopleForDay = DEMO_PEOPLE.slice(0, DEMO_PEOPLE.length - (dayIndex % DESK_STRIDE));

    return peopleForDay.slice(0, desksForDay.length).map((person, index) => ({
      id: `demo-${date}-${desksForDay[index].id}`,
      deskId: desksForDay[index].id,
      date,
      person,
      createdAt: `${today}T08:00:00.000Z`,
    }));
  });
}
