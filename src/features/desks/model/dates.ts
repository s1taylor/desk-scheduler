/**
 * Calendar-day helpers. Dates are plain "YYYY-MM-DD" strings; all arithmetic
 * happens in UTC so daylight-saving shifts never move a day.
 */

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;
const SUNDAY = 0;
const SATURDAY = 6;

export interface DateParts {
  readonly weekday: string;
  readonly day: string;
  readonly month: string;
}

const shortFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const longFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toUtcMs(iso: string): number | null {
  const match = ISO_DATE_PATTERN.exec(iso);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const ms = Date.UTC(year, month - 1, day);
  const date = new Date(ms);
  const isRealDate =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;

  return isRealDate ? ms : null;
}

function requireUtcMs(iso: string): number {
  const ms = toUtcMs(iso);
  if (ms === null) throw new Error(`Invalid ISO date: "${iso}"`);
  return ms;
}

function fromUtcMs(ms: number): string {
  const date = new Date(ms);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && toUtcMs(value) !== null;
}

/** Formats a Date using the viewer's local calendar day. */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayIso(now: Date = new Date()): string {
  return toIsoDate(now);
}

export function addDays(iso: string, days: number): string {
  return fromUtcMs(requireUtcMs(iso) + days * MS_PER_DAY);
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((requireUtcMs(toIso) - requireUtcMs(fromIso)) / MS_PER_DAY);
}

export function isWeekend(iso: string): boolean {
  const weekday = new Date(requireUtcMs(iso)).getUTCDay();
  return weekday === SATURDAY || weekday === SUNDAY;
}

/** Returns `count` working days starting at `startIso` (inclusive), skipping weekends. */
export function upcomingWeekdays(startIso: string, count: number): string[] {
  const days: string[] = [];
  let cursor = startIso;
  while (days.length < count) {
    if (!isWeekend(cursor)) days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function formatShortDate(iso: string): string {
  return shortFormatter.format(requireUtcMs(iso));
}

export function formatLongDate(iso: string): string {
  return longFormatter.format(requireUtcMs(iso));
}

export function formatDateParts(iso: string): DateParts {
  const parts = shortFormatter.formatToParts(requireUtcMs(iso));
  const find = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";

  return { weekday: find("weekday"), day: find("day"), month: find("month") };
}
