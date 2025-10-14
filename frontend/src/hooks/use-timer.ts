import { useState, useEffect, useRef } from 'react';

export const useTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [isPrimed, setIsPrimed] = useState(false);
  const [startTs, setStartTs] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  
  const holdTimer = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const startTimer = () => {
    setStartTs(performance.now());
    setElapsed(0);
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPrimed(false);
    setIsHolding(false);
    if (holdTimer.current) clearTimeout(holdTimer.current);
    return elapsed;
  };

  // Running timer effect
  useEffect(() => {
    if (!isRunning || startTs === null) return;
    const loop = () => {
      setElapsed(performance.now() - startTs);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning, startTs]);

  return {
    isRunning,
    isHolding,
    isPrimed,
    elapsed,
    startTimer,
    stopTimer,
    setIsHolding,
    setIsPrimed,
    holdTimer
  };
};