import { bookingStore } from "../model/booking-store";
import { bookDesk, cancelBooking, moveBooking, type BookingContext, type BookingResult } from "../model/bookings";
import { formatLongDate, formatShortDate } from "../model/dates";
import { createId } from "../model/ids";
import { getDesk } from "../model/office-layout";
import type { Booking, Desk } from "../model/types";
import type { Feedback } from "./FeedbackMessage";

interface BookingActionDeps {
  readonly bookings: readonly Booking[];
  readonly userName: string;
  readonly selectedDate: string;
  readonly selectedDesk: Desk | undefined;
  readonly context: BookingContext;
  readonly setFeedback: (feedback: Feedback) => void;
}

export interface BookingActions {
  readonly bookSelected: () => void;
  readonly moveToSelected: (existingBookingId: string) => void;
  readonly cancel: (bookingId: string) => void;
}

function deskName(deskId: string): string {
  return `desk ${getDesk(deskId)?.label ?? deskId}`;
}

/** Runs a pure booking operation, persists it on success, and reports the outcome either way. */
export function createBookingActions(deps: BookingActionDeps): BookingActions {
  const { bookings, userName, selectedDate, selectedDesk, context, setFeedback } = deps;

  const apply = (result: BookingResult, successMessage: string): void => {
    if (!result.ok) {
      setFeedback({ tone: "error", message: result.error });
      return;
    }
    bookingStore.setBookings(result.value);
    setFeedback({ tone: "success", message: successMessage });
  };

  const buildRequest = (deskId: string): Booking => ({
    id: createId(),
    deskId,
    date: selectedDate,
    person: userName,
    createdAt: new Date().toISOString(),
  });

  return {
    bookSelected() {
      if (!selectedDesk) return;
      apply(
        bookDesk(bookings, buildRequest(selectedDesk.id), context),
        `You're booked at ${deskName(selectedDesk.id)} on ${formatLongDate(selectedDate)}.`,
      );
    },
    moveToSelected(existingBookingId) {
      if (!selectedDesk) return;
      apply(
        moveBooking(bookings, existingBookingId, buildRequest(selectedDesk.id), context),
        `Moved your booking to ${deskName(selectedDesk.id)} on ${formatLongDate(selectedDate)}.`,
      );
    },
    cancel(bookingId) {
      const target = bookings.find((b) => b.id === bookingId);
      const message = target
        ? `Cancelled ${deskName(target.deskId)} on ${formatShortDate(target.date)}.`
        : "Booking cancelled.";
      apply(cancelBooking(bookings, bookingId, userName), message);
    },
  };
}
