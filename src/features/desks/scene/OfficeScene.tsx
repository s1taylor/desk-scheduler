"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useCallback, useMemo, useState } from "react";
import type { Desk, DeskStatus } from "../model/types";
import { Plants } from "./Decor";
import { Desk3D, deskLabelPosition } from "./Desk3D";
import {
  AreaLabelChip,
  DeskLabelChip,
  LabelLayer,
  LabelProjector,
  useLabelElements,
  type LabelAnchor,
} from "./labels";
import { LOUNGE_LABEL, Lounge } from "./Lounge";
import { MEETING_ROOM_LABEL, MeetingRoom } from "./MeetingRoom";
import { ENTRANCE_LABEL, Room } from "./Room";
import { CAMERA, ORBIT, SCENE_COLORS } from "./scene-constants";

export interface OfficeSceneProps {
  readonly desks: readonly Desk[];
  readonly statuses: Readonly<Record<string, DeskStatus>>;
  readonly selectedDeskId: string | null;
  readonly onSelectDesk: (deskId: string) => void;
}

const SHADOW_MAP_SIZE = 2048;
const SHADOW_EXTENT = 12;

const AREA_ANCHORS: readonly LabelAnchor[] = [MEETING_ROOM_LABEL, LOUNGE_LABEL, ENTRANCE_LABEL].map((area) => ({
  id: `area:${area.text}`,
  position: area.position,
  content: <AreaLabelChip text={area.text} />,
}));

function SceneLights() {
  return (
    <>
      <hemisphereLight args={["#ffffff", "#cbd5e1", 1.1]} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[SHADOW_MAP_SIZE, SHADOW_MAP_SIZE]}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
        shadow-bias={-0.0004}
      />
    </>
  );
}

/** Interactive 3D floor plan. Loaded client-only because WebGL has no server equivalent. */
export default function OfficeScene({ desks, statuses, selectedDeskId, onSelectDesk }: OfficeSceneProps) {
  const [hoveredDeskId, setHoveredDeskId] = useState<string | null>(null);
  const { elements, register } = useLabelElements();

  const handleHoverChange = useCallback((deskId: string, isHovered: boolean) => {
    setHoveredDeskId((current) => {
      if (isHovered) return deskId;
      return current === deskId ? null : current;
    });
  }, []);

  const anchors = useMemo<readonly LabelAnchor[]>(
    () => [
      ...AREA_ANCHORS,
      ...desks.map((desk) => {
        const isSelected = desk.id === selectedDeskId;
        return {
          id: `desk:${desk.id}`,
          position: deskLabelPosition(desk),
          content: (
            <DeskLabelChip
              label={desk.label}
              status={statuses[desk.id] ?? "available"}
              isSelected={isSelected}
              isActive={isSelected || desk.id === hoveredDeskId}
            />
          ),
        };
      }),
    ],
    [desks, statuses, selectedDeskId, hoveredDeskId],
  );

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: CAMERA.position, fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far }}
      >
        <color attach="background" args={[SCENE_COLORS.background]} />
        <SceneLights />
        <Room />
        <MeetingRoom />
        <Lounge />
        <Plants />
        {desks.map((desk) => (
          <Desk3D
            key={desk.id}
            desk={desk}
            status={statuses[desk.id] ?? "available"}
            isSelected={desk.id === selectedDeskId}
            isHovered={desk.id === hoveredDeskId}
            onSelect={onSelectDesk}
            onHoverChange={handleHoverChange}
          />
        ))}
        <OrbitControls
          makeDefault
          target={[0, 0, 0]}
          enablePan={false}
          enableDamping
          minDistance={ORBIT.minDistance}
          maxDistance={ORBIT.maxDistance}
          maxPolarAngle={ORBIT.maxPolarAngle}
        />
        <LabelProjector anchors={anchors} elements={elements} />
      </Canvas>
      <LabelLayer anchors={anchors} register={register} />
    </div>
  );
}
