import { useEffect } from 'react';

interface UseKeyboardControlsProps {
  isRunning: boolean;
  isPrimed: boolean;
  isHolding: boolean;
  onStartHold: () => void;
  onStopHold: () => void;
  onStart: () => void;
  onStop: () => void;
  onTogglePlus2: () => void;
  onToggleDNF: () => void;
}

export const useKeyboardControls = ({
  isRunning,
  isPrimed,
  isHolding,
  onStartHold,
  onStopHold,
  onStart,
  onStop,
  onTogglePlus2,
  onToggleDNF
}: UseKeyboardControlsProps) => {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (isRunning) return;
        if (!isHolding) onStartHold();
      }
      if (e.key === "+") onTogglePlus2();
      if (e.key === "Delete") onToggleDNF();
    };

    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (isRunning) {
          onStop();
          return;
        }
        if (isPrimed) onStart();
        onStopHold();
      }
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [isRunning, isPrimed, isHolding, onStartHold, onStopHold, onStart, onStop, onTogglePlus2, onToggleDNF]);
};