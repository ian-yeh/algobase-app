import React, { useRef, useState } from "react";
import { useSquare1Scene, generateScrambleSequence, type MoveTask, type Square } from "@algobase/square-one";
import { Toolbar } from "./Toolbar";

export interface SquareOneProps {
  initialSequence?: string;
  autoRotate?: boolean;
  className?: string;
}

export const SquareOne: React.FC<SquareOneProps> = ({
  initialSequence = "",
  autoRotate = false,
  className = "h-96 w-full rounded-xl overflow-hidden relative",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [canSlice, setCanSlice] = useState<boolean>(true);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("Ready");

  const { rendererRef, queueRef } = useSquare1Scene(containerRef, {
    autoRotate,
    initialSequence,
    onMoveStart: () => setIsBusy(true),
    onMoveComplete: (_task: MoveTask, currentState: Square) => {
      setCanSlice(currentState.canSlice());
      setIsBusy(queueRef.current?.isBusy() ?? false);
    },
    onQueueEmpty: () => {
      setIsBusy(false);
      setStatusMessage("Idle");
    },
    onSliceBlocked: () => {
      setStatusMessage("Slice Blocked! Seam misaligned.");
    },
  });

  const handleTurnTop = (u: number) => {
    queueRef.current?.enqueueTurn(u, 0);
  };

  const handleTurnBottom = (d: number) => {
    queueRef.current?.enqueueTurn(0, d);
  };

  const handleSlice = () => {
    queueRef.current?.enqueueSlice();
  };

  const handleScramble = () => {
    if (!rendererRef.current) return;
    const scramble = generateScrambleSequence(rendererRef.current.getState());
    queueRef.current?.enqueueSequence(scramble, 180);
  };

  const handleRunPreset = (sequence: string) => {
    queueRef.current?.enqueueSequence(sequence, 220);
  };

  const handleReset = () => {
    if (!rendererRef.current) return;
    queueRef.current?.clear();
    rendererRef.current.resetState();
    setCanSlice(true);
    setStatusMessage("Reset to Solved");
  };

  return (
    <div className={className}>
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-2 left-2 text-xs font-mono text-foreground/45">{statusMessage}</div>
      <Toolbar
        isBusy={isBusy}
        canSlice={canSlice}
        onTurnTop={handleTurnTop}
        onTurnBottom={handleTurnBottom}
        onSlice={handleSlice}
        onScramble={handleScramble}
        onReset={handleReset}
        onRunPreset={handleRunPreset}
      />
    </div>
  );
};

export default SquareOne;
