export type ZoneId = "window" | "pods" | "standing";

export type DeskKind = "sitting" | "standing";

export type DeskStatus = "available" | "booked" | "mine";

export interface Zone {
  readonly id: ZoneId;
  readonly name: string;
  readonly description: string;
}

export interface Desk {
  readonly id: string;
  readonly label: string;
  readonly zone: ZoneId;
  readonly kind: DeskKind;
  readonly monitors: 1 | 2;
  /** Centre of the desk on the floor plan, in metres from the room centre. */
  readonly x: number;
  readonly z: number;
  /** Rotation around the vertical axis in radians. 0 = the person faces the back wall (-z). */
  readonly rotation: number;
  readonly features: readonly string[];
}

export interface Booking {
  readonly id: string;
  readonly deskId: string;
  /** Calendar day in YYYY-MM-DD form. */
  readonly date: string;
  readonly person: string;
  /** ISO timestamp of when the booking was made. */
  readonly createdAt: string;
}

export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: string };
