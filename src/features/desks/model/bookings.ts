import { BOOKING_WINDOW_DAYS, MAX_NAME_LENGTH } from "./constants";
import { daysBetween, isIsoDate, isWeekend } from "./dates";
import type { Booking, Desk, DeskStatus, Result } from "./types";

/** Booking rules are pure: every operation returns a new array and never mutates its input. */

export type BookingResult = Result<readonly Booking[]>;

export interface BookingContext {
  /** The viewer's current calendar day, YYYY-MM-DD. */
  readonly today: string;
  readonly desks: readonly Desk[];
}

const fail = (error: string): BookingResult => ({ ok: false, error });
const succeed = (value: readonly Booking[]): BookingResult => ({ ok: true, value });

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function isSamePerson(a: string, b: string): boolean {
  const left = normalizeName(a).toLowerCase();
  return left !== "" && left === normalizeName(b).toLowerCase();
}

export function findBooking(
  bookings: readonly Booking[],
  deskId: string,
  date: string,
): Booking | undefined {
  return bookings.find((b) => b.deskId === deskId && b.date === date);
}

export function findBookingForPerson(
  bookings: readonly Booking[],
  person: string,
  date: string,
): Booking | undefined {
  return bookings.find((b) => b.date === date && isSamePerson(b.person, person));
}

function deskLabel(desks: readonly Desk[], deskId: string): string {
  return desks.find((d) => d.id === deskId)?.label ?? deskId;
}

function validateName(person: string): string | null {
  if (person === "") return "Enter your name before booking a desk.";
  if (person.length > MAX_NAME_LENGTH) return `Names must be ${MAX_NAME_LENGTH} characters or fewer.`;
  return null;
}

function validateDate(date: string, today: string): string | null {
  if (!isIsoDate(date)) return "Pick a valid date.";
  const offset = daysBetween(today, date);
  if (offset < 0) return "You can't book a date in the past.";
  if (offset > BOOKING_WINDOW_DAYS) return `Desks can only be booked up to ${BOOKING_WINDOW_DAYS} days ahead.`;
  if (isWeekend(date)) return "The office is closed on weekends.";
  return null;
}

function validateDesk(bookings: readonly Booking[], request: Booking, desks: readonly Desk[]): string | null {
  const desk = desks.find((d) => d.id === request.deskId);
  if (!desk) return "That desk doesn't exist.";

  const existing = findBooking(bookings, desk.id, request.date);
  if (!existing) return null;
  return isSamePerson(existing.person, request.person)
    ? `You've already booked ${desk.label} for that day.`
    : `${desk.label} is already booked by ${existing.person} that day.`;
}

function validatePersonFree(bookings: readonly Booking[], request: Booking, desks: readonly Desk[]): string | null {
  const existing = findBookingForPerson(bookings, request.person, request.date);
  if (!existing) return null;
  return `You already have ${deskLabel(desks, existing.deskId)} booked that day. Cancel it or move your booking instead.`;
}

export function validateBooking(
  bookings: readonly Booking[],
  request: Booking,
  context: BookingContext,
): string | null {
  return (
    validateName(normalizeName(request.person)) ??
    validateDate(request.date, context.today) ??
    validateDesk(bookings, request, context.desks) ??
    validatePersonFree(bookings, request, context.desks)
  );
}

export function bookDesk(
  bookings: readonly Booking[],
  request: Booking,
  context: BookingContext,
): BookingResult {
  const error = validateBooking(bookings, request, context);
  if (error) return fail(error);
  return succeed([...bookings, { ...request, person: normalizeName(request.person) }]);
}

export function cancelBooking(
  bookings: readonly Booking[],
  bookingId: string,
  person: string,
): BookingResult {
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) return fail("That booking no longer exists.");
  if (!isSamePerson(booking.person, person)) return fail("You can only cancel your own bookings.");
  return succeed(bookings.filter((b) => b.id !== bookingId));
}

/** Cancels `existingBookingId` and books `request` as one step; nothing changes if either part fails. */
export function moveBooking(
  bookings: readonly Booking[],
  existingBookingId: string,
  request: Booking,
  context: BookingContext,
): BookingResult {
  const cancelled = cancelBooking(bookings, existingBookingId, request.person);
  if (!cancelled.ok) return cancelled;
  return bookDesk(cancelled.value, request, context);
}

export function getDeskStatus(
  bookings: readonly Booking[],
  deskId: string,
  date: string,
  userName: string,
): DeskStatus {
  const booking = findBooking(bookings, deskId, date);
  if (!booking) return "available";
  return isSamePerson(booking.person, userName) ? "mine" : "booked";
}

export function getDeskStatuses(
  bookings: readonly Booking[],
  desks: readonly Desk[],
  date: string,
  userName: string,
): Readonly<Record<string, DeskStatus>> {
  return Object.fromEntries(desks.map((desk) => [desk.id, getDeskStatus(bookings, desk.id, date, userName)]));
}

export function countAvailable(bookings: readonly Booking[], desks: readonly Desk[], date: string): number {
  return desks.filter((desk) => !findBooking(bookings, desk.id, date)).length;
}

export function upcomingBookingsFor(
  bookings: readonly Booking[],
  person: string,
  today: string,
): readonly Booking[] {
  return bookings
    .filter((b) => b.date >= today && isSamePerson(b.person, person))
    .sort((a, b) => a.date.localeCompare(b.date));
}
