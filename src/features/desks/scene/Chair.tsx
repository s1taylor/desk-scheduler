import { SCENE_COLORS } from "./scene-constants";

interface ChairProps {
  readonly position: [number, number, number];
  readonly rotation?: number;
}

/** Office chair with its backrest on +z, so whoever sits in it faces -z. */
export function Chair({ position, rotation = 0 }: ChairProps) {
  return (
    <group position={position} rotation-y={rotation}>
      <mesh position={[0, 0.46, 0]} castShadow>
        <boxGeometry args={[0.48, 0.07, 0.46]} />
        <meshStandardMaterial color={SCENE_COLORS.chair} />
      </mesh>
      <mesh position={[0, 0.78, 0.21]} castShadow>
        <boxGeometry args={[0.46, 0.56, 0.06]} />
        <meshStandardMaterial color={SCENE_COLORS.chair} />
      </mesh>
      <mesh position={[0, 0.23, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.42, 8]} />
        <meshStandardMaterial color={SCENE_COLORS.metal} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.04, 16]} />
        <meshStandardMaterial color={SCENE_COLORS.metal} />
      </mesh>
    </group>
  );
}
