import type { DeskKind } from "../model/types";

/** Furniture dimensions, in metres. */
export const DESK_WIDTH = 1.4;
export const DESK_DEPTH = 0.7;
export const DESK_TOP_THICKNESS = 0.04;
export const DESK_HEIGHT: Readonly<Record<DeskKind, number>> = { sitting: 0.74, standing: 1.05 };

/** Heights of flat floor decals, kept apart so they never z-fight. */
export const SURFACE_Y = { rug: 0.01, padBorder: 0.016, pad: 0.022 } as const;

export const SCENE_COLORS = {
  background: "#eef1f5",
  floor: "#e9e4dc",
  floorBase: "#c9c1b5",
  wall: "#f7f5f2",
  window: "#cfe3fb",
  windowGlow: "#9cc5f5",
  windowFrame: "#475569",
  door: "#a47551",
  rug: "#d9dde4",
  loungeRug: "#d6cfc4",
  deskTop: "#d8bd96",
  deskFrame: "#3f3f46",
  metal: "#52525b",
  chair: "#2f3338",
  monitor: "#18181b",
  screen: "#1e293b",
  screenGlow: "#3b82f6",
  glass: "#bae6fd",
  plantPot: "#b8aea2",
  plantLeaf: "#4d7c0f",
  plantLeafLight: "#65a30d",
  sofa: "#64748b",
  counter: "#e4e4e7",
  counterTop: "#9ca3af",
  appliance: "#d4d4d8",
} as const;

export const CAMERA = {
  position: [11, 13, 15] as [number, number, number],
  fov: 40,
  near: 0.5,
  far: 100,
} as const;

export const ORBIT = {
  minDistance: 8,
  maxDistance: 38,
  maxPolarAngle: Math.PI / 2.3,
} as const;
