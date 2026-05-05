import { Capsule, Text } from "@react-three/drei";
import type { PersonaState } from "@/replay/usePersonaPositions";
import { roleToColor } from "@/replay/roleColors";

export function AgentMesh({ state }: { state: PersonaState }) {
  const color = roleToColor(state.role);
  return (
    <group
      position={[state.worldX, state.worldY, state.worldZ]}
      data-testid={`agent-${state.id.replace(/\s+/g, "_")}`}
    >
      <Capsule args={[0.18, 0.4, 4, 8]}>
        <meshStandardMaterial color={color} />
      </Capsule>
      <Text
        position={[0, 0.9, 0]}
        fontSize={0.18}
        color="#ffffff"
        outlineWidth={0.02}
        outlineColor="#000000"
        anchorX="center"
        anchorY="bottom"
      >
        {state.id}
      </Text>
    </group>
  );
}
