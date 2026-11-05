"use client";

import { useFrame } from "@react-three/fiber";
import { useCallback, useRef, type ReactNode, type RefCallback, type RefObject } from "react";
import { Vector3 } from "three";
import { SELECTED_COLOR, STATUS_COLORS } from "../model/constants";
import type { DeskStatus } from "../model/types";
import { ColorDot } from "../ui/ColorDot";

/**
 * Floating labels rendered as plain DOM in the page's own React root and moved
 * over the canvas every frame. (drei's <Html> creates a separate React root per
 * label, which React 19 warns about whenever those roots unmount.)
 */

export interface AreaLabel {
  readonly text: string;
  readonly position: readonly [number, number, number];
}

export interface LabelAnchor {
  readonly id: string;
  readonly position: readonly [number, number, number];
  readonly content: ReactNode;
}

type LabelElements = Map<string, HTMLElement>;

interface LabelRegistry {
  readonly elements: RefObject<LabelElements>;
  readonly register: (id: string) => RefCallback<HTMLElement>;
}

/** Closer labels stack above farther ones; NDC depth is scaled to integer z-indices. */
const DEPTH_TO_Z_INDEX = 100_000;
const projected = new Vector3();

export function useLabelElements(): LabelRegistry {
  const elements = useRef<LabelElements>(new Map());
  const register = useCallback(
    (id: string): RefCallback<HTMLElement> =>
      (element) => {
        if (!element) return;
        elements.current.set(id, element);
        return () => {
          elements.current.delete(id);
        };
      },
    [],
  );
  return { elements, register };
}

interface LabelProjectorProps {
  readonly anchors: readonly LabelAnchor[];
  readonly elements: RefObject<LabelElements>;
}

/** Lives inside the Canvas and moves each label to its anchor's screen position every frame. */
export function LabelProjector({ anchors, elements }: LabelProjectorProps) {
  useFrame(({ camera, size }) => {
    for (const anchor of anchors) {
      const element = elements.current.get(anchor.id);
      if (!element) continue;

      const [x, y, z] = anchor.position;
      projected.set(x, y, z).project(camera);
      const screenX = (projected.x * 0.5 + 0.5) * size.width;
      const screenY = (-projected.y * 0.5 + 0.5) * size.height;

      element.style.visibility = projected.z < 1 ? "visible" : "hidden";
      element.style.zIndex = String(Math.round((1 - projected.z) * DEPTH_TO_Z_INDEX));
      element.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%)`;
    }
  });
  return null;
}

interface LabelLayerProps {
  readonly anchors: readonly LabelAnchor[];
  readonly register: (id: string) => RefCallback<HTMLElement>;
}

/** DOM overlay above the canvas. Decorative: the desk list is the accessible equivalent. */
export function LabelLayer({ anchors, register }: LabelLayerProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {anchors.map((anchor) => (
        <div key={anchor.id} ref={register(anchor.id)} className="absolute left-0 top-0" style={{ visibility: "hidden" }}>
          {anchor.content}
        </div>
      ))}
    </div>
  );
}

interface DeskLabelChipProps {
  readonly label: string;
  readonly status: DeskStatus;
  readonly isActive: boolean;
  readonly isSelected: boolean;
}

export function DeskLabelChip({ label, status, isActive, isSelected }: DeskLabelChipProps) {
  return (
    <div
      className={`flex select-none items-center gap-1 whitespace-nowrap rounded-full border-2 bg-white/95 px-2 py-0.5 font-semibold text-slate-800 shadow-sm transition-transform ${
        isActive ? "scale-110 text-xs" : "text-[11px]"
      }`}
      style={{ borderColor: isSelected ? SELECTED_COLOR : "transparent" }}
    >
      <ColorDot color={STATUS_COLORS[status]} className="size-2" />
      {label}
    </div>
  );
}

export function AreaLabelChip({ text }: { readonly text: string }) {
  return (
    <span className="select-none whitespace-nowrap rounded-md bg-slate-900/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
      {text}
    </span>
  );
}
