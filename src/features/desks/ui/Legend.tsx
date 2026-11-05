import { SELECTED_COLOR, STATUS_COLORS, STATUS_LABELS } from "../model/constants";
import type { DeskStatus } from "../model/types";
import { ColorDot } from "./ColorDot";

const STATUSES: readonly DeskStatus[] = ["available", "booked", "mine"];

const LEGEND_ITEMS = [
  ...STATUSES.map((status) => ({ label: STATUS_LABELS[status], color: STATUS_COLORS[status] })),
  { label: "Selected", color: SELECTED_COLOR },
];

const OVERLAY = "pointer-events-none absolute z-30 rounded-lg bg-white/90 text-xs text-slate-700 shadow-sm backdrop-blur";

export function Legend() {
  return (
    <div className={`${OVERLAY} bottom-3 left-3 flex flex-wrap gap-x-3 gap-y-1 px-3 py-2`}>
      {LEGEND_ITEMS.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <ColorDot color={item.color} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function SceneHint() {
  return (
    <p className={`${OVERLAY} left-3 top-3 px-3 py-1.5`}>Drag to rotate · Scroll to zoom · Click a desk to select it</p>
  );
}
