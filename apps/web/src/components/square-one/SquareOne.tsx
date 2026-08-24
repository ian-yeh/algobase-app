import React, { useRef, useState } from "react";
import {
  useSquare1Scene,
  generateScrambleSequence,
  identifyCspCase,
  shapeFromLayerKinds,
  type MoveTask,
  type Square,
  type CspIdentification,
} from "@algobase/square-one";
import { Toolbar } from "./Toolbar";
import { CspCasePopup } from "./CspCasePopup";

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
  const pendingScrambleLogRef = useRef<boolean>(false);

  const [canSlice, setCanSlice] = useState<boolean>(true);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [cspRevealed, setCspRevealed] = useState<CspIdentification | null>(null);
  const [scrambleSequence, setScrambleSequence] = useState<string>("");
  const [scrambleCopied, setScrambleCopied] = useState(false);

  const { rendererRef, queueRef } = useSquare1Scene(containerRef, {
    autoRotate,
    initialSequence,
    onMoveStart: () => setIsBusy(true),
    onMoveComplete: (task: MoveTask, currentState: Square) => {
      setCanSlice(currentState.canSlice());
      setIsBusy(queueRef.current?.isBusy() ?? false);
      setCspRevealed(null);

      // Debug: log what the scramble actually left the puzzle in, read straight off the
      // real Square state machine after the scramble has actually been applied - not a
      // separately-simulated copy.
      if (task.type === "sequence" && pendingScrambleLogRef.current) {
        pendingScrambleLogRef.current = false;
        const topKinds = currentState.getTopLayerKinds();
        const bottomKinds = currentState.getBottomLayerKinds();
        console.log("[Square-1 scramble]", {
          sequence: task.sequenceStr,
          topKinds,
          bottomKinds,
          topShape: shapeFromLayerKinds(topKinds, "top"),
          bottomShape: shapeFromLayerKinds(bottomKinds, "bottom"),
          identification: identifyCspCase(currentState),
        });
      }
    },
    onQueueEmpty: () => {
      setIsBusy(false);
    },
    onSliceBlocked: () => {},
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
    pendingScrambleLogRef.current = true;
    setScrambleSequence(scramble);
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
    setCspRevealed(null);
    setScrambleSequence("");
  };

  const handleRevealCsp = () => {
    if (!rendererRef.current) return;
    const result = identifyCspCase(rendererRef.current.getState());
    setCspRevealed(result);
  };

  const handlePlayCspAlg = (sequence: string) => {
    queueRef.current?.enqueueSequence(sequence, 220);
    setCspRevealed(null);
  };

  const handleCopyScramble = async () => {
    await navigator.clipboard.writeText(scrambleSequence);
    setScrambleCopied(true);
    setTimeout(() => setScrambleCopied(false), 1500);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {scrambleSequence && (
        <div className="flex items-center gap-2 w-full max-w-md text-xs font-mono">
          <span className="text-foreground/70 break-all">{scrambleSequence}</span>
          <button
            onClick={handleCopyScramble}
            className="shrink-0 rounded border border-foreground/20 text-foreground/70 px-1.5 py-0.5 hover:bg-foreground/10 transition-colors"
          >
            {scrambleCopied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
      <div className={className}>
        <div ref={containerRef} className="w-full h-full" />
        <Toolbar
          isBusy={isBusy}
          canSlice={canSlice}
          onTurnTop={handleTurnTop}
          onTurnBottom={handleTurnBottom}
          onSlice={handleSlice}
          onScramble={handleScramble}
          onReset={handleReset}
          onRunPreset={handleRunPreset}
          onRevealCsp={handleRevealCsp}
        />
      </div>
      {cspRevealed && (
        <CspCasePopup
          result={cspRevealed}
          onPlayAlg={handlePlayCspAlg}
          onClose={() => setCspRevealed(null)}
          playDisabled={isBusy}
        />
      )}
    </div>
  );
};

export default SquareOne;
