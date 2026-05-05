import { useMemo } from "react";
import type { ExpandedFrame } from "./expandFrames";
import type { PersonaRole, ReplayPersona, ReplayPersonaFinalState } from "./types";

export interface PersonaState {
  id: string;
  role: PersonaRole;
  worldX: number;
  worldY: number;
  worldZ: number;
  pronunciatio?: string | null;
  description?: string | null;
  finalState?: ReplayPersonaFinalState;
}

// Avatars float above all furniture (tallest equipment is medical equipment
// at world Y ≈ 1.15). FLOATING_Y is the absolute world-Y of the capsule
// CENTER. With the capsule (radius 0.25, length 0.55) used in AgentMesh, the
// bottom of the capsule lands at FLOATING_Y - 0.525 = 1.175, just above the
// tallest furniture. If new equipment exceeds Y=1.15, bump FLOATING_Y.
const FLOATING_Y = 1.7;

export function usePersonaPositions(args: {
  expanded: ExpandedFrame[];
  personas: ReplayPersona[];
  currentStep: number;
  interpAlpha: number;
}): Record<string, PersonaState> {
  const personaIndex = useMemo(() => {
    const map = new Map<string, ReplayPersona>();
    for (const p of args.personas) map.set(p.id, p);
    return map;
  }, [args.personas]);

  return useMemo(() => {
    const cur = args.expanded[args.currentStep];
    const next = args.expanded[Math.min(args.currentStep + 1, args.expanded.length - 1)];
    if (!cur) return {};

    const out: Record<string, PersonaState> = {};
    for (const [id, delta] of Object.entries(cur.agents)) {
      const meta = personaIndex.get(id);
      const role: PersonaRole = meta?.role ?? "Unknown";

      const fromX = delta.x ?? 0;
      const fromY = delta.y ?? 0;
      const nDelta = next?.agents?.[id];
      const toX = nDelta?.x ?? fromX;
      const toY = nDelta?.y ?? fromY;

      const lerpX = fromX + (toX - fromX) * args.interpAlpha;
      const lerpY = fromY + (toY - fromY) * args.interpAlpha;

      out[id] = {
        id,
        role,
        worldX: lerpX + 0.5,
        worldZ: lerpY + 0.5,
        worldY: FLOATING_Y,
        pronunciatio: delta.pronunciatio ?? null,
        description: delta.description ?? null,
        finalState: meta?.finalState,
      };
    }
    return out;
  }, [args.expanded, args.currentStep, args.interpAlpha, personaIndex]);
}
