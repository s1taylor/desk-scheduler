import type { AreaLabel } from "./labels";
import { SCENE_COLORS } from "./scene-constants";

const COUNTER = { x: 8.62, z: 3.5, length: 4.2, depth: 0.7, height: 0.88, topThickness: 0.04 } as const;
const FRIDGE = { x: 8.6, z: 0.85, size: 0.75, height: 1.9 } as const;
const SOFA = { x: 5.6, z: 5.25, width: 2.2, depth: 0.85, seatHeight: 0.42 } as const;
const COFFEE_TABLE = { x: 5.6, z: 4.0, radius: 0.45, height: 0.4 } as const;

export const LOUNGE_LABEL: AreaLabel = { text: "Kitchen & lounge", position: [7.1, 2.1, 3.6] };

function Kitchen() {
  const topY = COUNTER.height + COUNTER.topThickness / 2;
  return (
    <group>
      <mesh position={[COUNTER.x, COUNTER.height / 2, COUNTER.z]} castShadow receiveShadow>
        <boxGeometry args={[COUNTER.depth, COUNTER.height, COUNTER.length]} />
        <meshStandardMaterial color={SCENE_COLORS.counter} />
      </mesh>
      <mesh position={[COUNTER.x, topY, COUNTER.z]} receiveShadow>
        <boxGeometry args={[COUNTER.depth + 0.06, COUNTER.topThickness, COUNTER.length + 0.06]} />
        <meshStandardMaterial color={SCENE_COLORS.counterTop} />
      </mesh>
      <mesh position={[COUNTER.x, topY + 0.18, COUNTER.z + 1.2]} castShadow>
        <boxGeometry args={[0.35, 0.36, 0.3]} />
        <meshStandardMaterial color={SCENE_COLORS.monitor} />
      </mesh>
      <mesh position={[FRIDGE.x, FRIDGE.height / 2, FRIDGE.z]} castShadow>
        <boxGeometry args={[FRIDGE.size, FRIDGE.height, FRIDGE.size]} />
        <meshStandardMaterial color={SCENE_COLORS.appliance} />
      </mesh>
    </group>
  );
}

/** Sofa facing the room (-z) with its back against the front wall. */
function Sofa() {
  const armOffset = SOFA.width / 2 - 0.09;
  return (
    <group position={[SOFA.x, 0, SOFA.z]}>
      <mesh position={[0, SOFA.seatHeight / 2, 0]} castShadow>
        <boxGeometry args={[SOFA.width, SOFA.seatHeight, SOFA.depth]} />
        <meshStandardMaterial color={SCENE_COLORS.sofa} />
      </mesh>
      <mesh position={[0, 0.62, SOFA.depth / 2 - 0.1]} castShadow>
        <boxGeometry args={[SOFA.width, 0.5, 0.2]} />
        <meshStandardMaterial color={SCENE_COLORS.sofa} />
      </mesh>
      {[-armOffset, armOffset].map((x) => (
        <mesh key={x} position={[x, 0.3, 0]} castShadow>
          <boxGeometry args={[0.18, 0.6, SOFA.depth]} />
          <meshStandardMaterial color={SCENE_COLORS.sofa} />
        </mesh>
      ))}
    </group>
  );
}

function CoffeeTable() {
  return (
    <group position={[COFFEE_TABLE.x, 0, COFFEE_TABLE.z]}>
      <mesh position={[0, COFFEE_TABLE.height, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[COFFEE_TABLE.radius, COFFEE_TABLE.radius, 0.04, 32]} />
        <meshStandardMaterial color={SCENE_COLORS.deskTop} />
      </mesh>
      <mesh position={[0, COFFEE_TABLE.height / 2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, COFFEE_TABLE.height, 8]} />
        <meshStandardMaterial color={SCENE_COLORS.metal} />
      </mesh>
    </group>
  );
}

export function Lounge() {
  return (
    <group>
      <Kitchen />
      <Sofa />
      <CoffeeTable />
    </group>
  );
}
