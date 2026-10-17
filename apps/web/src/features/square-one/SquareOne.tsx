import React, { useEffect, useRef, useState } from "react";
import { useSquare1Scene, type Square } from "@algobase/square-one";
import { Toolbar } from "./Toolbar";

export interface SquareOneProps {
  // Applied from solved whenever it changes - scrambles are the inverse of a solve, so the puzzle must start solved.
  scramble: string;
  onScramble: () => void;
  // false = jump straight to the scrambled state instead of playing the scramble.
  animated?: boolean;
  className?: string;
}

export const SquareOne: React.FC<SquareOneProps> = ({
  scramble,
  onScramble,
  animated = true,
  className = "h-96 w-full rounded-xl overflow-hidden relative",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [canSlice, setCanSlice] = useState<boolean>(true);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const { queueRef } = useSquare1Scene(containerRef, {
    autoRotate: false,
    initialSequence: "",
    onMoveStart: () => setIsBusy(true),
    onMoveComplete: (_task, currentState: Square) => {
      setCanSlice(currentState.canSlice());
      setIsBusy(queueRef.current?.isBusy() ?? false);
    },
    onQueueEmpty: () => {
      setIsBusy(false);
    },
    onSliceBlocked: () => {},
  });

  const reset = () => {
    const queue = queueRef.current;
    if (!queue) return;
    queue.clear();
    queue.resetState();
    setCanSlice(true);
  };

  useEffect(() => {
    reset();
    const queue = queueRef.current;
    if (!queue || !scramble) return;
    if (animated) {
      queue.enqueueSequence(scramble, 180);
    } else {
      queue.applyInstant(scramble);
      setCanSlice(queue.getState().canSlice());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scramble, queueRef]);

  return (
    <div className={className}>
      <div ref={containerRef} className="w-full h-full" />
      <Toolbar
        isBusy={isBusy}
        canSlice={canSlice}
        onTurnTop={(u) => queueRef.current?.enqueueTurn(u, 0)}
        onTurnBottom={(d) => queueRef.current?.enqueueTurn(0, d)}
        onSlice={() => queueRef.current?.enqueueSlice()}
        onScramble={onScramble}
        onReset={reset}
        onRunPreset={(sequence) => queueRef.current?.enqueueSequence(sequence, 220)}
      />
    </div>
  );
};

export default SquareOne;
