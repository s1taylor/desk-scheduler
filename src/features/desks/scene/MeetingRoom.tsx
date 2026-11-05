import { ROOM } from "../model/constants";
import { Chair } from "./Chair";
import type { AreaLabel } from "./labels";
import { SCENE_COLORS } from "./scene-constants";

const BOUNDS = { minX: 4.2, maxX: ROOM.width / 2, minZ: -ROOM.depth / 2, maxZ: -1.6 } as const;
const CENTER_X = (BOUNDS.minX + BOUNDS.maxX) / 2;
const CENTER_Z = (BOUNDS.minZ + BOUNDS.maxZ) / 2;
const GLASS = { height: 2.4, thickness: 0.05, opacity: 0.22, railHeight: 0.05 } as const;
const DOORWAY_WIDTH = 1;
const TABLE = { width: 2.6, depth: 1.1, height: 0.74, thickness: 0.05 } as const;
const CHAIR_XS = [-0.8, 0, 0.8] as const;
const CHAIR_OFFSET_Z = 0.9;
const SCREEN = { width: 1.8, height: 1.0, y: 1.5 } as const;

export const MEETING_ROOM_LABEL: AreaLabel = {
  text: "Meeting room",
  position: [CENTER_X, GLASS.height + 0.35, CENTER_Z],
};

interface GlassPanelProps {
  readonly position: [number, number, number];
  readonly size: [number, number, number];
}

function GlassPanel({ position, size }: GlassPanelProps) {
  const [width, , depth] = size;
  return (
    <>
      <mesh position={position}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={SCENE_COLORS.glass} transparent opacity={GLASS.opacity} depthWrite={false} />
      </mesh>
      <mesh position={[position[0], GLASS.height, position[2]]}>
        <boxGeometry args={[width + 0.02, GLASS.railHeight, depth + 0.02]} />
        <meshStandardMaterial color={SCENE_COLORS.deskFrame} />
      </mesh>
    </>
  );
}

function MeetingTable() {
  return (
    <group position={[CENTER_X, 0, CENTER_Z]}>
      <mesh position={[0, TABLE.height, 0]} castShadow receiveShadow>
        <boxGeometry args={[TABLE.width, TABLE.thickness, TABLE.depth]} />
        <meshStandardMaterial color={SCENE_COLORS.deskTop} />
      </mesh>
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, TABLE.height / 2, 0]} castShadow>
          <boxGeometry args={[0.08, TABLE.height, 0.6]} />
          <meshStandardMaterial color={SCENE_COLORS.deskFrame} />
        </mesh>
      ))}
      {CHAIR_XS.map((x) => (
        <Chair key={`front-${x}`} position={[x, 0, CHAIR_OFFSET_Z]} />
      ))}
      {CHAIR_XS.map((x) => (
        <Chair key={`back-${x}`} position={[x, 0, -CHAIR_OFFSET_Z]} rotation={Math.PI} />
      ))}
    </group>
  );
}

export function MeetingRoom() {
  const lengthAlongZ = BOUNDS.maxZ - BOUNDS.minZ;
  const frontWallLength = BOUNDS.maxX - BOUNDS.minX - DOORWAY_WIDTH;
  const frontWallCenterX = BOUNDS.minX + DOORWAY_WIDTH + frontWallLength / 2;

  return (
    <group>
      <GlassPanel
        position={[BOUNDS.minX, GLASS.height / 2, CENTER_Z]}
        size={[GLASS.thickness, GLASS.height, lengthAlongZ]}
      />
      <GlassPanel
        position={[frontWallCenterX, GLASS.height / 2, BOUNDS.maxZ]}
        size={[frontWallLength, GLASS.height, GLASS.thickness]}
      />
      <MeetingTable />
      <mesh position={[BOUNDS.maxX - 0.02, SCREEN.y, CENTER_Z]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[SCREEN.width, SCREEN.height]} />
        <meshStandardMaterial color={SCENE_COLORS.screen} emissive={SCENE_COLORS.screenGlow} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}
