import { useState } from "react";
import { loadReplayFromFile } from "@/replay/loadReplay";
import type { ReplayFile } from "@/replay/types";

export function ReplayDropZone({
  onLoaded,
  onError,
}: {
  onLoaded: (replay: ReplayFile) => void;
  onError: (e: unknown) => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      data-testid="replay-dropzone"
      onDragOver={(e) => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={async (e) => {
        e.preventDefault();
        setHover(false);
        const file = e.dataTransfer.files[0];
        if (!file) return;
        try {
          const replay = await loadReplayFromFile(file);
          onLoaded(replay);
        } catch (err) {
          onError(err);
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "all",
        background: hover ? "rgba(45,108,223,0.18)" : "transparent",
        border: hover ? "3px dashed #2D6CDF" : "none",
        zIndex: 10,
      }}
    />
  );
}
