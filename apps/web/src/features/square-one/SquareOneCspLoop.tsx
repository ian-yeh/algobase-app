import { useEffect, useRef } from "react";
import { useSquare1Scene, CSP_CASES, invertSequence } from "@algobase/square-one";

// A visually distinctive case (barrel <-> solved) to loop as decoration, not a specific
// lesson - any CSP case's alg run forward then backward returns to solved.
const CSP_CASE = CSP_CASES.find((c) => c.id === "barrel-barrel")!;
const FORWARD_ALG = CSP_CASE.oddAlg!.sequence;
const REVERSE_ALG = invertSequence(FORWARD_ALG);
const LOOP_PAUSE_MS = 500;

// Small, non-interactive Square-1 that continuously plays a CSP alg and its inverse,
// back and forth, for use as a decorative preview (e.g. a training menu card).
export const SquareOneCspLoop: React.FC<{ className?: string }> = ({ className = "h-40 w-full" }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playedForwardRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { queueRef } = useSquare1Scene(containerRef, {
    autoRotate: true,
    initialSequence: "",
    onMoveStart: () => {},
    onMoveComplete: () => {},
    onQueueEmpty: () => {
      timeoutRef.current = setTimeout(() => {
        const sequence = playedForwardRef.current ? REVERSE_ALG : FORWARD_ALG;
        playedForwardRef.current = !playedForwardRef.current;
        queueRef.current?.enqueueSequence(sequence, 260);
      }, LOOP_PAUSE_MS);
    },
    onSliceBlocked: () => {},
  });

  useEffect(() => {
    queueRef.current?.enqueueSequence(FORWARD_ALG, 260);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [queueRef]);

  return <div ref={containerRef} className={className} />;
};

export default SquareOneCspLoop;
