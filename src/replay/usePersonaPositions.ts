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

const AGENT_HEIGHT = 0.7;

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
        worldY: AGENT_HEIGHT * 0.5,
        pronunciatio: delta.pronunciatio ?? null,
        description: delta.description ?? null,
        finalState: meta?.finalState,
      };
    }
    return out;
  }, [args.expanded, args.currentStep, args.interpAlpha, personaIndex]);
}
