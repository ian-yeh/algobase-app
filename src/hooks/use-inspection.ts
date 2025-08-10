import { useState, useEffect } from 'react';

export const useInspection = (enabled: boolean, scramble: string, isRunning: boolean) => {
  const [isInspecting, setIsInspecting] = useState(true);
  const [inspectLeft, setInspectLeft] = useState(15_000);

  // Start inspection when scramble changes
  useEffect(() => {
    if (!enabled) return;
    setIsInspecting(true);
    setInspectLeft(15_000);
  }, [scramble, enabled]);

  // Inspection countdown
  useEffect(() => {
    if (!isInspecting) return;
    const start = performance.now();
    const tick = () => {
      const d = performance.now() - start;
      const left = Math.max(0, 15_000 - d);
      setInspectLeft(left);
      if (left > 0 && !isRunning && isInspecting) {
        requestAnimationFrame(tick);
      }
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [isInspecting, isRunning]);

  return {
    isInspecting,
    inspectLeft,
    setIsInspecting
  };
};