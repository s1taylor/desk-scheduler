import type { Desk, DeskKind, Zone, ZoneId } from "./types";

export const OFFICE_NAME = "HQ · Level 3";

export const ZONES: readonly Zone[] = [
  { id: "window", name: "Window row", description: "Quiet desks along the windows" },
  { id: "pods", name: "Team pods", description: "Four-desk clusters for working together" },
  { id: "standing", name: "Standing desks", description: "Raised desks by the entrance" },
];

/** Distance from a pod's centre to each desk's centre. */
const POD_OFFSET_X = 0.72;
const POD_OFFSET_Z = 0.375;

interface RowSpec {
  readonly prefix: string;
  readonly zone: ZoneId;
  readonly kind: DeskKind;
  readonly monitors: 1 | 2;
  readonly z: number;
  readonly xs: readonly number[];
  readonly rotation: number;
  readonly features: readonly string[];
}

interface PodSpec {
  readonly prefix: string;
  readonly centerX: number;
  readonly centerZ: number;
  readonly monitors: 1 | 2;
  readonly features: readonly string[];
}

function deskRow(spec: RowSpec): Desk[] {
  return spec.xs.map((x, index) => {
    const id = `${spec.prefix}${index + 1}`;
    return {
      id,
      label: id,
      zone: spec.zone,
      kind: spec.kind,
      monitors: spec.monitors,
      x,
      z: spec.z,
      rotation: spec.rotation,
      features: spec.features,
    };
  });
}

/** Four desks in a 2×2 cluster; the back pair faces the front pair across the monitors. */
function pod(spec: PodSpec): Desk[] {
  const seats = [
    { sx: -1, sz: -1, rotation: Math.PI },
    { sx: 1, sz: -1, rotation: Math.PI },
    { sx: -1, sz: 1, rotation: 0 },
    { sx: 1, sz: 1, rotation: 0 },
  ] as const;

  return seats.map((seat, index) => {
    const id = `${spec.prefix}${index + 1}`;
    return {
      id,
      label: id,
      zone: "pods",
      kind: "sitting",
      monitors: spec.monitors,
      x: spec.centerX + seat.sx * POD_OFFSET_X,
      z: spec.centerZ + seat.sz * POD_OFFSET_Z,
      rotation: seat.rotation,
      features: spec.features,
    };
  });
}

export const DESKS: readonly Desk[] = [
  ...deskRow({
    prefix: "A",
    zone: "window",
    kind: "sitting",
    monitors: 2,
    z: -5.2,
    xs: [-7.2, -5.4, -3.6, -1.8, 0],
    rotation: 0,
    features: ["Window view", "Dual monitors"],
  }),
  ...pod({ prefix: "B", centerX: -5.2, centerZ: 0.4, monitors: 2, features: ["Team pod", "Dual monitors"] }),
  ...pod({ prefix: "C", centerX: -1.0, centerZ: 0.4, monitors: 1, features: ["Team pod", "Single monitor"] }),
  ...deskRow({
    prefix: "D",
    zone: "standing",
    kind: "standing",
    monitors: 1,
    z: 4.6,
    xs: [-7, -5, -3, -1],
    rotation: Math.PI,
    features: ["Standing", "Near entrance"],
  }),
];

export function getDesk(deskId: string): Desk | undefined {
  return DESKS.find((desk) => desk.id === deskId);
}

export function getZone(zoneId: ZoneId): Zone | undefined {
  return ZONES.find((zone) => zone.id === zoneId);
}
