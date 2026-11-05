import { ROOM } from "../model/constants";
import type { AreaLabel } from "./labels";
import { SCENE_COLORS, SURFACE_Y } from "./scene-constants";

const HALF_WIDTH = ROOM.width / 2;
const HALF_DEPTH = ROOM.depth / 2;
const SLAB = { thickness: 0.3, margin: 0.2, gap: 0.005 } as const;
const WINDOW = { y: 1.55, height: 1.4, frame: 0.08 } as const;
const WINDOWS = [
  { x: -6.3, width: 2.6 },
  { x: -2.7, width: 2.6 },
  { x: 0.9, width: 2.6 },
  { x: 6.6, width: 3.2 },
] as const;
const DOOR = { x: 2.4, width: 1.1, height: 2.1 } as const;
const RUGS = [
  { x: -5.2, z: 0.4, width: 3.4, depth: 3.4, color: SCENE_COLORS.rug },
  { x: -1.0, z: 0.4, width: 3.4, depth: 3.4, color: SCENE_COLORS.rug },
  { x: 5.6, z: 4.4, width: 3.6, depth: 2.8, color: SCENE_COLORS.loungeRug },
] as const;

export const ENTRANCE_LABEL: AreaLabel = {
  text: "Entrance",
  position: [DOOR.x, DOOR.height + 0.35, HALF_DEPTH - 0.3],
};

interface WallProps {
  readonly position: [number, number, number];
  readonly rotationY: number;
  readonly width: number;
}

/**
 * Walls are single-sided planes facing into the room. When the camera orbits
 * behind a wall its back face is culled, giving a dollhouse cut-away view.
 */
function Wall({ position, rotationY, width }: WallProps) {
  return (
    <mesh position={position} rotation-y={rotationY} receiveShadow>
      <planeGeometry args={[width, ROOM.wallHeight]} />
      <meshStandardMaterial color={SCENE_COLORS.wall} />
    </mesh>
  );
}

interface BackWindowProps {
  readonly x: number;
  readonly width: number;
}

function BackWindow({ x, width }: BackWindowProps) {
  return (
    <group position={[x, WINDOW.y, -HALF_DEPTH]}>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width + WINDOW.frame * 2, WINDOW.height + WINDOW.frame * 2]} />
        <meshStandardMaterial color={SCENE_COLORS.windowFrame} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[width, WINDOW.height]} />
        <meshStandardMaterial color={SCENE_COLORS.window} emissive={SCENE_COLORS.windowGlow} emissiveIntensity={0.45} />
      </mesh>
    </group>
  );
}

export function Room() {
  const wallY = ROOM.wallHeight / 2;

  return (
    <group>
      <mesh position={[0, -SLAB.thickness / 2 - SLAB.gap, 0]}>
        <boxGeometry args={[ROOM.width + SLAB.margin, SLAB.thickness, ROOM.depth + SLAB.margin]} />
        <meshStandardMaterial color={SCENE_COLORS.floorBase} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshStandardMaterial color={SCENE_COLORS.floor} />
      </mesh>

      {RUGS.map((rug) => (
        <mesh key={`${rug.x}:${rug.z}`} rotation-x={-Math.PI / 2} position={[rug.x, SURFACE_Y.rug, rug.z]} receiveShadow>
          <planeGeometry args={[rug.width, rug.depth]} />
          <meshStandardMaterial color={rug.color} />
        </mesh>
      ))}

      <Wall position={[0, wallY, -HALF_DEPTH]} rotationY={0} width={ROOM.width} />
      <Wall position={[0, wallY, HALF_DEPTH]} rotationY={Math.PI} width={ROOM.width} />
      <Wall position={[-HALF_WIDTH, wallY, 0]} rotationY={Math.PI / 2} width={ROOM.depth} />
      <Wall position={[HALF_WIDTH, wallY, 0]} rotationY={-Math.PI / 2} width={ROOM.depth} />

      {WINDOWS.map((window) => (
        <BackWindow key={window.x} x={window.x} width={window.width} />
      ))}

      <mesh position={[DOOR.x, DOOR.height / 2, HALF_DEPTH - 0.02]} rotation-y={Math.PI}>
        <planeGeometry args={[DOOR.width, DOOR.height]} />
        <meshStandardMaterial color={SCENE_COLORS.door} />
      </mesh>
    </group>
  );
}
