import type { DeskStatus } from "./types";

/** How many calendar days ahead a desk can be booked. */
export const BOOKING_WINDOW_DAYS = 28;

/** Number of upcoming weekdays shown in the date picker. */
export const DATE_STRIP_DAYS = 10;

export const MAX_NAME_LENGTH = 60;

export const STORAGE_KEY = "desk-scheduler:v1";
export const STORAGE_VERSION = 1;

/** Floor plan dimensions in metres. The room is centred on the origin. */
export const ROOM = {
  width: 18,
  depth: 12,
  wallHeight: 2.8,
} as const;

export const STATUS_COLORS: Readonly<Record<DeskStatus, string>> = {
  available: "#10b981",
  booked: "#f43f5e",
  mine: "#6366f1",
};

export const SELECTED_COLOR = "#f59e0b";

export const STATUS_LABELS: Readonly<Record<DeskStatus, string>> = {
  available: "Available",
  booked: "Booked",
  mine: "Your booking",
};
