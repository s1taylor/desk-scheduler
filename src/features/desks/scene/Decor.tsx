import { SCENE_COLORS } from "./scene-constants";

/** [x, z, scale] for each potted plant. */
const PLANTS: readonly (readonly [number, number, number])[] = [
  [-8.5, -5.5, 1],
  [-8.5, 5.5, 1.1],
  [3.0, -5.4, 0.9],
  [3.2, 5.4, 1],
  [1.6, 0.4, 0.8],
  [3.9, -1.2, 0.8],
];

interface PlantProps {
  readonly x: number;
  readonly z: number;
  readonly scale: number;
}

function Plant({ x, z, scale }: PlantProps) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.16, 0.4, 16]} />
        <meshStandardMaterial color={SCENE_COLORS.plantPot} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <icosahedronGeometry args={[0.38, 0]} />
        <meshStandardMaterial color={SCENE_COLORS.plantLeaf} flatShading />
      </mesh>
      <mesh position={[0.1, 1.02, 0.05]} castShadow>
        <icosahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial color={SCENE_COLORS.plantLeafLight} flatShading />
      </mesh>
    </group>
  );
}

export function Plants() {
  return (
    <>
      {PLANTS.map(([x, z, scale]) => (
        <Plant key={`${x}:${z}`} x={x} z={z} scale={scale} />
      ))}
    </>
  );
}
