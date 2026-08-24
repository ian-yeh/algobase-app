import React, { useRef, useState } from "react";
import { useSquare1Scene, invertSequence, getCspAlg, type CspIdentification, type CspParity } from "@algobase/square-one";

const noop = () => {};

// Modal overlay with a small secondary 3D viewer showing the identified CSP case in
// its canonical (unrotated) orientation.
export const CspCasePopup: React.FC<{
  result: CspIdentification;
  onPlayAlg: (sequence: string) => void;
  onClose: () => void;
  playDisabled: boolean;
}> = ({ result, onPlayAlg, onClose, playDisabled }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [parityChoice, setParityChoice] = useState<CspParity>(result.parity);

  const alg = getCspAlg(result.cspCase, parityChoice);

  // The scene's queue negates D per token (renderer.turnBottom's physical convention),
  // so feed the raw inverse of the alg, not getReferenceSetup's engine-convention one -
  // the queue's negation turns it into exactly that.
  useSquare1Scene(containerRef, {
    autoRotate: true,
    initialSequence: invertSequence(alg.sequence),
    onMoveStart: noop,
    onMoveComplete: noop,
    onQueueEmpty: noop,
    onSliceBlocked: noop,
  });

  return (
    <div className="flex flex-col w-full max-w-md rounded-md border border-foreground/10 bg-background/95 p-3 text-xs font-mono space-y-2 mb-12">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-foreground/45">
            {result.cspCase.topShape} / {result.cspCase.bottomShape}
            {result.flipped ? " (flipped)" : ""}
          </span>
          <span className={result.parityKnown ? "text-accent" : "text-foreground/45"}>
            {result.parity}
            {!result.parityKnown ? " (unconfirmed)" : ""}
          </span>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded border border-foreground/20 text-foreground/70 px-1.5 py-0.5 hover:bg-foreground/10 transition-colors"
        >
          Close
        </button>
      </div>
      <div className="flex items-center gap-1">
        {(["even", "odd"] as const).map((parity) => (
          <button
            key={parity}
            onClick={() => setParityChoice(parity)}
            className={`rounded border px-1.5 py-0.5 transition-colors ${
              parityChoice === parity
                ? "border-accent/30 text-accent bg-accent/10"
                : "border-foreground/20 text-foreground/45 hover:text-foreground"
            }`}
          >
            {parity}
          </button>
        ))}
      </div>
      <div ref={containerRef} className="h-52 w-full rounded overflow-hidden" />
      <div className="flex items-center gap-2">
        <span className="text-foreground">
          {alg.label}: {alg.sequence}
        </span>
        <button
          onClick={() => onPlayAlg(alg.sequence)}
          disabled={playDisabled || !alg.sequence}
          className="shrink-0 rounded border border-accent/30 text-accent px-1.5 py-0.5 hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Play
        </button>
      </div>
    </div>
  );
};
