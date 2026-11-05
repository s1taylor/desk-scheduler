"use client";

import dynamic from "next/dynamic";
import { DESKS } from "../model/office-layout";
import { SceneErrorBoundary } from "../scene/SceneErrorBoundary";
import { AppHeader } from "./AppHeader";
import { DateStrip } from "./DateStrip";
import { DeskDetails } from "./DeskDetails";
import { DeskList } from "./DeskList";
import { FeedbackMessage } from "./FeedbackMessage";
import { Legend, SceneHint } from "./Legend";
import { MyBookings } from "./MyBookings";
import { StorageNotice } from "./StorageNotice";
import { useDeskScheduler } from "./use-desk-scheduler";

const OfficeScene = dynamic(() => import("../scene/OfficeScene"), {
  ssr: false,
  loading: () => <ScenePlaceholder message="Loading 3D office…" />,
});

const RESET_CONFIRMATION = "Replace all bookings in this browser with fresh demo data?";

function ScenePlaceholder({ message }: { readonly message: string }) {
  return <div className="grid h-full place-items-center p-6 text-center text-sm text-slate-500">{message}</div>;
}

export function SchedulerApp() {
  const s = useDeskScheduler();

  const handleReset = () => {
    if (window.confirm(RESET_CONFIRMATION)) s.resetDemoData();
  };

  return (
    <div className="flex min-h-dvh flex-col bg-slate-100 text-slate-900 lg:h-dvh">
      <AppHeader userName={s.userName} onUserNameChange={s.setUserName} />
      {s.storageError && <StorageNotice message={s.storageError} onDismiss={s.dismissStorageError} />}

      <main className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        <section aria-label="3D office floor plan" className="relative h-[55vh] min-h-[360px] overflow-hidden lg:h-auto lg:flex-1">
          <SceneErrorBoundary
            fallback={
              <ScenePlaceholder message="The 3D view couldn't load in this browser (WebGL may be disabled). You can still choose desks from the list." />
            }
          >
            <OfficeScene
              desks={DESKS}
              statuses={s.statuses}
              selectedDeskId={s.selectedDesk?.id ?? null}
              onSelectDesk={s.selectDesk}
            />
          </SceneErrorBoundary>
          <SceneHint />
          <Legend />
        </section>

        <aside className="flex w-full flex-col gap-6 border-t border-slate-200 bg-white p-5 lg:w-[380px] lg:overflow-y-auto lg:border-l lg:border-t-0">
          <DateStrip dates={s.dates} selectedDate={s.selectedDate} availability={s.availability} onSelect={s.selectDate} />

          <div className="flex flex-col gap-3">
            {s.feedback && <FeedbackMessage feedback={s.feedback} onDismiss={s.dismissFeedback} />}
            <DeskDetails
              desk={s.selectedDesk}
              status={s.selectedDesk ? s.statuses[s.selectedDesk.id] : "available"}
              booking={s.selectedBooking}
              myBookingThatDay={s.myBookingThatDay}
              date={s.selectedDate}
              hasName={s.hasName}
              onBook={s.bookSelected}
              onMove={s.moveToSelected}
              onCancel={s.cancel}
            />
          </div>

          <DeskList desks={DESKS} statuses={s.statuses} selectedDeskId={s.selectedDesk?.id ?? null} onSelect={s.selectDesk} />
          <MyBookings bookings={s.myUpcoming} hasName={s.hasName} onView={s.viewBooking} onCancel={s.cancel} />

          <footer className="mt-auto border-t border-slate-100 pt-4 text-xs text-slate-500">
            No database yet: bookings are saved in this browser only.{" "}
            <button type="button" onClick={handleReset} className="font-medium text-slate-700 underline underline-offset-2">
              Reset demo data
            </button>
          </footer>
        </aside>
      </main>
    </div>
  );
}
