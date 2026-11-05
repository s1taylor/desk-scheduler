import { normalizeName } from "../model/bookings";
import { MAX_NAME_LENGTH } from "../model/constants";
import { OFFICE_NAME } from "../model/office-layout";

interface AppHeaderProps {
  readonly userName: string;
  readonly onUserNameChange: (name: string) => void;
}

export function AppHeader({ userName, onUserNameChange }: AppHeaderProps) {
  const isMissingName = normalizeName(userName) === "";

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3">
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="grid size-9 place-items-center rounded-lg bg-slate-900 text-sm font-bold text-white">
          DB
        </div>
        <div>
          <h1 className="text-base font-semibold leading-tight">Desk Booking</h1>
          <p className="text-xs text-slate-500">{OFFICE_NAME}</p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <span className="text-slate-500">Booking as</span>
        <input
          value={userName}
          onChange={(event) => onUserNameChange(event.target.value)}
          maxLength={MAX_NAME_LENGTH}
          placeholder="Your name"
          autoComplete="name"
          aria-invalid={isMissingName}
          className={`w-48 rounded-lg border px-3 py-1.5 text-sm outline-none transition-colors focus:border-slate-900 focus:ring-1 focus:ring-slate-900 ${
            isMissingName ? "border-amber-400 bg-amber-50" : "border-slate-300 bg-white"
          }`}
        />
      </label>
    </header>
  );
}
