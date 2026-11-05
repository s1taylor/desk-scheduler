import { STATUS_COLORS, STATUS_LABELS } from "../model/constants";
import { formatShortDate } from "../model/dates";
import { getDesk, getZone } from "../model/office-layout";
import type { Booking, Desk, DeskStatus } from "../model/types";
import { Button } from "./Button";
import { ColorDot } from "./ColorDot";

interface DeskDetailsProps {
  readonly desk: Desk | undefined;
  readonly status: DeskStatus;
  /** The booking on this desk for the selected date, if any. */
  readonly booking: Booking | undefined;
  /** The viewer's own booking on the selected date, on any desk. */
  readonly myBookingThatDay: Booking | undefined;
  readonly date: string;
  readonly hasName: boolean;
  readonly onBook: () => void;
  readonly onMove: (existingBookingId: string) => void;
  readonly onCancel: (bookingId: string) => void;
}

type SelectedDeskProps = DeskDetailsProps & { readonly desk: Desk };

function deskLabel(deskId: string): string {
  return getDesk(deskId)?.label ?? deskId;
}

function describeStatus({ status, booking, myBookingThatDay, date }: SelectedDeskProps): string {
  const day = formatShortDate(date);
  if (status === "mine") return `You're booked here on ${day}.`;
  if (status === "booked" && booking) return `Booked by ${booking.person} on ${day}.`;
  if (myBookingThatDay) return `Free on ${day}. You're currently at ${deskLabel(myBookingThatDay.deskId)} that day.`;
  return `Free on ${day}.`;
}

function DeskAction(props: SelectedDeskProps) {
  const { desk, status, booking, myBookingThatDay, date, hasName, onBook, onMove, onCancel } = props;

  if (status === "mine" && booking) {
    return (
      <Button variant="danger" onClick={() => onCancel(booking.id)}>
        Cancel my booking
      </Button>
    );
  }
  if (status === "booked") return <Button disabled>Unavailable</Button>;
  if (!hasName) return <Button disabled>Enter your name to book</Button>;
  if (myBookingThatDay) {
    return <Button onClick={() => onMove(myBookingThatDay.id)}>Move here from {deskLabel(myBookingThatDay.deskId)}</Button>;
  }
  return (
    <Button onClick={onBook}>
      Book {desk.label} · {formatShortDate(date)}
    </Button>
  );
}

function EmptyState() {
  return (
    <section className="rounded-xl border border-dashed border-slate-300 p-5 text-center">
      <h2 className="text-sm font-semibold text-slate-700">No desk selected</h2>
      <p className="mt-1 text-sm text-slate-500">Click a desk in the 3D view, or pick one from the list below.</p>
    </section>
  );
}

export function DeskDetails(props: DeskDetailsProps) {
  const { desk, status } = props;
  if (!desk) return <EmptyState />;
  const selected: SelectedDeskProps = { ...props, desk };

  return (
    <section aria-labelledby="desk-heading" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{getZone(desk.zone)?.name}</p>
          <h2 id="desk-heading" className="text-2xl font-semibold tracking-tight">
            Desk {desk.label}
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">
          <ColorDot color={STATUS_COLORS[status]} />
          {STATUS_LABELS[status]}
        </span>
      </div>

      <ul aria-label="Desk features" className="mt-3 flex flex-wrap gap-1.5">
        {desk.features.map((feature) => (
          <li key={feature} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
            {feature}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-sm text-slate-600">{describeStatus(selected)}</p>
      <div className="mt-4">
        <DeskAction {...selected} />
      </div>
    </section>
  );
}
