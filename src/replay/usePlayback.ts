import { useCallback, useEffect, useRef, useState } from "react";

export type PlaybackSpeed = 1 | 4 | 16 | 64;

export interface PlaybackController {
  currentStep: number;
  interpAlpha: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  play: () => void;
  pause: () => void;
  setSpeed: (s: PlaybackSpeed) => void;
  seek: (step: number) => void;
}

export function usePlayback(opts: {
  totalSteps: number;
  secPerStep: number;
}): PlaybackController {
  const [currentStep, setCurrentStep] = useState(0);
  const [interpAlpha, setInterpAlpha] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(4);

  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  const tick = useCallback(
    (now: number) => {
      if (lastTickRef.current === null) lastTickRef.current = now;
      const dtSec = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      const stepsAdvanced = (dtSec * speed) / opts.secPerStep;
      setCurrentStep((prev) => {
        let next = prev + stepsAdvanced;
        const max = opts.totalSteps - 1;
        if (next >= max) {
          next = max;
          setIsPlaying(false);
        }
        const intStep = Math.floor(next);
        setInterpAlpha(next - intStep);
        return intStep;
      });

      rafRef.current = requestAnimationFrame(tick);
    },
    [opts.secPerStep, opts.totalSteps, speed]
  );

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTickRef.current = null;
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, tick]);

  return {
    currentStep,
    interpAlpha,
    totalSteps: opts.totalSteps,
    isPlaying,
    speed,
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    setSpeed,
    seek: (step: number) => {
      const clamped = Math.max(0, Math.min(opts.totalSteps - 1, Math.floor(step)));
      setCurrentStep(clamped);
      setInterpAlpha(0);
    },
  };
}
