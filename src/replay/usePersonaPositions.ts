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

// Avatars float above most furniture but stay visually grounded. With the
// capsule (radius 0.25, length 0.55) used in AgentMesh, FLOATING_Y=1.3 puts
// the capsule center at 1.3 and its bottom at 0.775 — clearly above beds
// (0.80) and chairs (0.78) for the common case, slightly intersecting the
// rare tall equipment (diagnostic table 0.98, medical equipment 1.15) which
// is acceptable because the head still floats well above.
const FLOATING_Y = 1.3;

// Deterministic XZ jitter per persona id so co-located avatars (e.g.
// doctor + nurse + patient sharing a trauma-room tile) fan out into 8
// fixed sub-tile slots instead of stacking on top of each other. The same
// persona always picks the same direction, so motion lerps cleanly.
const JITTER_RADIUS = 0.18;
function jitterFromId(id: string): [number, number] {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h * 31) + id.charCodeAt(i)) >>> 0;
  }
  const angle = (h % 8) * (Math.PI / 4);
  return [Math.cos(angle) * JITTER_RADIUS, Math.sin(angle) * JITTER_RADIUS];
}

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

      const [jx, jz] = jitterFromId(id);

      out[id] = {
        id,
        role,
        worldX: lerpX + 0.5 + jx,
        worldZ: lerpY + 0.5 + jz,
        worldY: FLOATING_Y,
        pronunciatio: delta.pronunciatio ?? null,
        description: delta.description ?? null,
        finalState: meta?.finalState,
      };
    }
    return out;
  }, [args.expanded, args.currentStep, args.interpAlpha, personaIndex]);
}
