import { STATUS_COLORS, STATUS_LABELS } from "../model/constants";
import { ZONES } from "../model/office-layout";
import type { Desk, DeskStatus } from "../model/types";
import { ColorDot } from "./ColorDot";
import { SECTION_HEADING } from "./styles";

interface DeskListProps {
  readonly desks: readonly Desk[];
  readonly statuses: Readonly<Record<string, DeskStatus>>;
  readonly selectedDeskId: string | null;
  readonly onSelect: (deskId: string) => void;
}

/** Keyboard- and screen-reader-friendly alternative to picking desks in the 3D view. */
export function DeskList({ desks, statuses, selectedDeskId, onSelect }: DeskListProps) {
  const freeCount = desks.filter((desk) => statuses[desk.id] === "available").length;

  return (
    <section aria-labelledby="desk-list-heading">
      <div className="flex items-baseline justify-between">
        <h2 id="desk-list-heading" className={SECTION_HEADING}>
          All desks
        </h2>
        <span className="text-xs text-slate-500">
          {freeCount} of {desks.length} free
        </span>
      </div>

      <div className="mt-2 space-y-3">
        {ZONES.map((zone) => (
          <div key={zone.id}>
            <h3 className="mb-1.5 text-xs text-slate-500">{zone.name}</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {desks
                .filter((desk) => desk.zone === zone.id)
                .map((desk) => {
                  const status = statuses[desk.id] ?? "available";
                  const isSelected = desk.id === selectedDeskId;
                  return (
                    <button
                      key={desk.id}
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={`Desk ${desk.label}, ${STATUS_LABELS[status]}`}
                      onClick={() => onSelect(desk.id)}
                      className={`flex items-center justify-center gap-1.5 rounded-md border px-1 py-1.5 text-sm font-medium transition-colors ${
                        isSelected
                          ? "border-amber-400 bg-amber-50 ring-1 ring-amber-400"
                          : "border-slate-200 bg-white hover:border-slate-400"
                      }`}
                    >
                      <ColorDot color={STATUS_COLORS[status]} className="size-2" />
                      {desk.label}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
