import { formatDateParts, formatLongDate } from "../model/dates";
import { SECTION_HEADING } from "./styles";

interface DateStripProps {
  readonly dates: readonly string[];
  readonly selectedDate: string;
  readonly availability: Readonly<Record<string, number>>;
  readonly onSelect: (date: string) => void;
}

function freeCountClass(isSelected: boolean, free: number): string {
  if (isSelected) return "text-slate-300";
  return free === 0 ? "text-rose-600" : "text-emerald-700";
}

export function DateStrip({ dates, selectedDate, availability, onSelect }: DateStripProps) {
  return (
    <section aria-labelledby="date-heading">
      <div className="flex items-baseline justify-between">
        <h2 id="date-heading" className={SECTION_HEADING}>
          Date
        </h2>
        <span className="text-xs text-slate-500">{formatLongDate(selectedDate)}</span>
      </div>

      <div className="-mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {dates.map((date) => {
          const parts = formatDateParts(date);
          const isSelected = date === selectedDate;
          const free = availability[date] ?? 0;

          return (
            <button
              key={date}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${formatLongDate(date)}, ${free} desks free`}
              onClick={() => onSelect(date)}
              className={`flex w-[52px] shrink-0 flex-col items-center rounded-lg border py-1.5 transition-colors ${
                isSelected
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">{parts.weekday}</span>
              <span className="text-lg font-semibold leading-6">{parts.day}</span>
              <span className={`text-[10px] ${freeCountClass(isSelected, free)}`}>{free} free</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
