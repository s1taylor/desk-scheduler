import { formatShortDate } from "../model/dates";
import { getDesk, getZone } from "../model/office-layout";
import type { Booking } from "../model/types";
import { SECTION_HEADING } from "./styles";

interface MyBookingsProps {
  readonly bookings: readonly Booking[];
  readonly hasName: boolean;
  readonly onView: (booking: Booking) => void;
  readonly onCancel: (bookingId: string) => void;
}

function BookingRow({ booking, onView, onCancel }: { readonly booking: Booking } & Pick<MyBookingsProps, "onView" | "onCancel">) {
  const desk = getDesk(booking.deskId);
  const zoneName = desk ? getZone(desk.zone)?.name : undefined;

  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2">
      <button type="button" onClick={() => onView(booking)} className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-medium text-slate-800">{formatShortDate(booking.date)}</span>
        <span className="block truncate text-xs text-slate-500">
          Desk {desk?.label ?? booking.deskId}
          {zoneName ? ` · ${zoneName}` : ""}
        </span>
      </button>
      <button
        type="button"
        onClick={() => onCancel(booking.id)}
        className="shrink-0 rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
      >
        Cancel
      </button>
    </li>
  );
}

export function MyBookings({ bookings, hasName, onView, onCancel }: MyBookingsProps) {
  return (
    <section aria-labelledby="my-bookings-heading">
      <h2 id="my-bookings-heading" className={SECTION_HEADING}>
        My upcoming bookings
      </h2>
      <div className="mt-2">
        {!hasName && <p className="text-sm text-slate-500">Enter your name at the top to see your bookings.</p>}
        {hasName && bookings.length === 0 && <p className="text-sm text-slate-500">Nothing booked yet.</p>}
        {hasName && bookings.length > 0 && (
          <ul className="space-y-1.5">
            {bookings.map((booking) => (
              <BookingRow key={booking.id} booking={booking} onView={onView} onCancel={onCancel} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
