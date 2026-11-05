"use client";

import { useCursor } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, type Group } from "three";
import { SELECTED_COLOR, STATUS_COLORS } from "../model/constants";
import type { Desk, DeskStatus } from "../model/types";
import { Chair } from "./Chair";
import {
  DESK_DEPTH,
  DESK_HEIGHT,
  DESK_TOP_THICKNESS,
  DESK_WIDTH,
  SCENE_COLORS,
  SURFACE_Y,
} from "./scene-constants";

interface Desk3DProps {
  readonly desk: Desk;
  readonly status: DeskStatus;
  readonly isSelected: boolean;
  readonly isHovered: boolean;
  readonly onSelect: (deskId: string) => void;
  readonly onHoverChange: (deskId: string, isHovered: boolean) => void;
}

const CHAIR_OFFSET_Z = 0.62;
/** The status pad spans from just behind the desk edge to past the chair. */
const PAD = { width: DESK_WIDTH, nearZ: -0.36, farZ: 0.98, border: 0.12 } as const;
const PAD_DEPTH = PAD.farZ - PAD.nearZ;
const PAD_CENTER_Z = (PAD.nearZ + PAD.farZ) / 2;
const PAD_TINT = { idle: 0.45, active: 0.85 } as const;
const LABEL_CLEARANCE = 0.85;
const MARKER = { clearance: 1.45, bobAmplitude: 0.08, bobSpeed: 3, spinSpeed: 1.6 } as const;
const MONITOR_INSET = 0.14;
const DUAL_MONITOR_X = 0.29;
const DUAL_MONITOR_ANGLE = 0.18;

/** World-space point above a desk where its floating label is anchored. */
export function deskLabelPosition(desk: Desk): [number, number, number] {
  return [desk.x, DESK_HEIGHT[desk.kind] + LABEL_CLEARANCE, desk.z];
}

export function Desk3D({ desk, status, isSelected, isHovered, onSelect, onHoverChange }: Desk3DProps) {
  useCursor(isHovered);
  const height = DESK_HEIGHT[desk.kind];

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(desk.id);
  };

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHoverChange(desk.id, true);
  };

  return (
    <group
      position={[desk.x, 0, desk.z]}
      rotation-y={desk.rotation}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={() => onHoverChange(desk.id, false)}
    >
      <StatusPad status={status} isActive={isHovered || isSelected} isSelected={isSelected} />
      <DeskFrame height={height} />
      <Monitors count={desk.monitors} deskHeight={height} />
      {desk.kind === "sitting" && <Chair position={[0, 0, CHAIR_OFFSET_Z]} />}
      {isSelected && <SelectionMarker baseY={height + MARKER.clearance} />}
    </group>
  );
}

interface StatusPadProps {
  readonly status: DeskStatus;
  readonly isActive: boolean;
  readonly isSelected: boolean;
}

function StatusPad({ status, isActive, isSelected }: StatusPadProps) {
  const color = useMemo(
    () => new Color(SCENE_COLORS.floor).lerp(new Color(STATUS_COLORS[status]), isActive ? PAD_TINT.active : PAD_TINT.idle),
    [status, isActive],
  );

  return (
    <>
      {isSelected && (
        <mesh rotation-x={-Math.PI / 2} position={[0, SURFACE_Y.padBorder, PAD_CENTER_Z]}>
          <planeGeometry args={[PAD.width + PAD.border * 2, PAD_DEPTH + PAD.border * 2]} />
          <meshBasicMaterial color={SELECTED_COLOR} />
        </mesh>
      )}
      <mesh rotation-x={-Math.PI / 2} position={[0, SURFACE_Y.pad, PAD_CENTER_Z]} receiveShadow>
        <planeGeometry args={[PAD.width, PAD_DEPTH]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </>
  );
}

interface DeskFrameProps {
  readonly height: number;
}

function DeskFrame({ height }: DeskFrameProps) {
  const legHeight = height - DESK_TOP_THICKNESS / 2;
  return (
    <>
      <mesh position={[0, height, 0]} castShadow receiveShadow>
        <boxGeometry args={[DESK_WIDTH, DESK_TOP_THICKNESS, DESK_DEPTH]} />
        <meshStandardMaterial color={SCENE_COLORS.deskTop} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (DESK_WIDTH / 2 - 0.06), legHeight / 2, 0]} castShadow>
          <boxGeometry args={[0.04, legHeight, DESK_DEPTH - 0.1]} />
          <meshStandardMaterial color={SCENE_COLORS.deskFrame} />
        </mesh>
      ))}
    </>
  );
}

interface MonitorsProps {
  readonly count: 1 | 2;
  readonly deskHeight: number;
}

function Monitors({ count, deskHeight }: MonitorsProps) {
  const surfaceY = deskHeight + DESK_TOP_THICKNESS / 2;
  const placements =
    count === 2
      ? [
          { x: -DUAL_MONITOR_X, angle: DUAL_MONITOR_ANGLE },
          { x: DUAL_MONITOR_X, angle: -DUAL_MONITOR_ANGLE },
        ]
      : [{ x: 0, angle: 0 }];

  return (
    <>
      {placements.map(({ x, angle }) => (
        <group key={x} position={[x, surfaceY, -DESK_DEPTH / 2 + MONITOR_INSET]} rotation-y={angle}>
          <mesh position={[0, 0.005, 0]}>
            <boxGeometry args={[0.2, 0.01, 0.14]} />
            <meshStandardMaterial color={SCENE_COLORS.monitor} />
          </mesh>
          <mesh position={[0, 0.13, -0.02]}>
            <boxGeometry args={[0.04, 0.24, 0.03]} />
            <meshStandardMaterial color={SCENE_COLORS.monitor} />
          </mesh>
          <mesh position={[0, 0.37, 0]} castShadow>
            <boxGeometry args={[0.54, 0.32, 0.025]} />
            <meshStandardMaterial color={SCENE_COLORS.monitor} />
          </mesh>
          <mesh position={[0, 0.37, 0.0135]}>
            <planeGeometry args={[0.5, 0.28]} />
            <meshStandardMaterial color={SCENE_COLORS.screen} emissive={SCENE_COLORS.screenGlow} emissiveIntensity={0.35} />
          </mesh>
        </group>
      ))}
    </>
  );
}

interface SelectionMarkerProps {
  readonly baseY: number;
}

function SelectionMarker({ baseY }: SelectionMarkerProps) {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    const marker = ref.current;
    if (!marker) return;
    const elapsed = clock.getElapsedTime();
    marker.position.y = baseY + Math.sin(elapsed * MARKER.bobSpeed) * MARKER.bobAmplitude;
    marker.rotation.y = elapsed * MARKER.spinSpeed;
  });

  return (
    <group ref={ref} position={[0, baseY, 0]}>
      <mesh rotation-x={Math.PI}>
        <coneGeometry args={[0.16, 0.36, 4]} />
        <meshStandardMaterial color={SELECTED_COLOR} emissive={SELECTED_COLOR} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}
