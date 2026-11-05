"use client";

import { useMemo, useState } from "react";
import { bookingStore, useBookingStore } from "../model/booking-store";
import {
  countAvailable,
  findBooking,
  findBookingForPerson,
  getDeskStatuses,
  normalizeName,
  upcomingBookingsFor,
  type BookingContext,
} from "../model/bookings";
import { DATE_STRIP_DAYS } from "../model/constants";
import { todayIso, upcomingWeekdays } from "../model/dates";
import { DESKS, getDesk } from "../model/office-layout";
import type { Booking } from "../model/types";
import { createBookingActions } from "./booking-actions";
import type { Feedback } from "./FeedbackMessage";

/** All state and handlers behind the scheduler screen. */
export function useDeskScheduler() {
  const { bookings, userName, storageError } = useBookingStore();
  const [today] = useState(todayIso);
  const dates = useMemo(() => upcomingWeekdays(today, DATE_STRIP_DAYS), [today]);
  const [selectedDate, setSelectedDate] = useState(() => dates[0]);
  const [selectedDeskId, setSelectedDeskId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const context: BookingContext = useMemo(() => ({ today, desks: DESKS }), [today]);
  const statuses = useMemo(
    () => getDeskStatuses(bookings, DESKS, selectedDate, userName),
    [bookings, selectedDate, userName],
  );
  const availability = useMemo(
    () => Object.fromEntries(dates.map((date) => [date, countAvailable(bookings, DESKS, date)])),
    [bookings, dates],
  );
  const myUpcoming = useMemo(() => upcomingBookingsFor(bookings, userName, today), [bookings, userName, today]);

  const selectedDesk = selectedDeskId ? getDesk(selectedDeskId) : undefined;
  const selectedBooking = selectedDesk ? findBooking(bookings, selectedDesk.id, selectedDate) : undefined;
  const myBookingThatDay = findBookingForPerson(bookings, userName, selectedDate);
  const actions = createBookingActions({ bookings, userName, selectedDate, selectedDesk, context, setFeedback });

  const select = (date: string, deskId: string | null): void => {
    setSelectedDate(date);
    setSelectedDeskId(deskId);
    setFeedback(null);
  };

  return {
    ...actions,
    userName,
    storageError,
    hasName: normalizeName(userName) !== "",
    dates,
    selectedDate,
    selectedDesk,
    selectedBooking,
    myBookingThatDay,
    statuses,
    availability,
    myUpcoming,
    feedback,
    selectDesk: (deskId: string) => select(selectedDate, deskId),
    selectDate: (date: string) => select(date, selectedDeskId),
    viewBooking: (booking: Booking) => select(booking.date, booking.deskId),
    dismissFeedback: () => setFeedback(null),
    setUserName: bookingStore.setUserName,
    dismissStorageError: bookingStore.dismissStorageError,
    resetDemoData: () => {
      bookingStore.resetDemoData();
      setFeedback({ tone: "success", message: "Demo bookings restored." });
    },
  };
}
