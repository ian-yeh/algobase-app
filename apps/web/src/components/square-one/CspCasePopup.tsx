import React, { useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuthStore } from "@/stores/authStore";
import { flipParity } from "@/lib/cspParity";
import { getEffectiveCspAlg } from "@/lib/cspCustomAlg";
import { useSquare1Scene, invertSequence, type CspIdentification, type CspParity } from "@algobase/square-one";

const noop = () => {};

// Modal overlay with a small secondary 3D viewer showing the identified CSP case in its canonical (unrotated) orientation.
export const CspCasePopup: React.FC<{
  result: CspIdentification;
  onPlayAlg: (sequence: string) => void;
  onClose: () => void;
  playDisabled: boolean;
}> = ({ result, onPlayAlg, onClose, playDisabled }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [parityChoice, setParityChoice] = useState<CspParity>(result.parity);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [speedMs, setSpeedMs] = useState(220);

  const token = useAuthStore((s) => s.token);
  const progress = useQuery(api.cspProgress.getCspProgress, token ? { token } : "skip");
  const customizations = useQuery(api.cspCustomization.getCspCustomizations, token ? { token } : "skip");
  const customization = customizations?.[result.cspCase.id] ?? null;
  // Per-case swap set in the case list - which physical parity the user calls "even"/"odd" for this case.
  const swapped = customization?.swapped ?? false;
  const setLearned = useMutation(api.cspProgress.setCspCaseLearned);
  const learned = progress?.[result.cspCase.id] ?? false;
  const toggleLearned = () => {
    if (!token) return;
    setLearned({ token, caseId: result.cspCase.id, learned: !learned });
  };

  const alg = getEffectiveCspAlg(result.cspCase, parityChoice, customization);
  const setupSequence = invertSequence(alg.sequence);

  // The queue negates D per token (see square1.utils.physicalToEngineD), so feed the raw inverse of the alg, not getReferenceSetup's engine-convention one - the queue's negation turns it into exactly that.
  const { queueRef: previewQueueRef } = useSquare1Scene(containerRef, {
    autoRotate: false,
    initialSequence: setupSequence,
    onMoveStart: () => setPreviewBusy(true),
    onMoveComplete: noop,
    onQueueEmpty: () => setPreviewBusy(false),
    onSliceBlocked: noop,
  });

  // The preview model is already set up in the case state (via the inverted alg above), so playing the alg forward here just solves it back down, same as it would on a real cube.
  const handlePlayOnPreview = () => {
    previewQueueRef.current?.enqueueSequence(alg.sequence, speedMs);
  };

  const handleResetPreview = () => {
    const queue = previewQueueRef.current;
    if (!queue) return;
    queue.clear();
    queue.resetState();
    queue.applyInstant(setupSequence);
  };

  return (
    <div className="flex flex-col w-full max-w-xl rounded-md border border-foreground/10 bg-background/95 p-4 text-xs font-mono space-y-3 mb-12">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-foreground/45">
            {result.cspCase.topShape} / {result.cspCase.bottomShape}
            {result.flipped ? " (flipped)" : ""}
          </span>
          <span className={result.parityKnown ? "text-accent" : "text-foreground/45"}>
            {swapped ? flipParity(result.parity) : result.parity}
            {!result.parityKnown ? " (unconfirmed)" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleLearned}
            disabled={!token}
            className={`shrink-0 rounded border px-1.5 py-0.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              learned
                ? "border-accent/30 text-accent bg-accent/10"
                : "border-foreground/20 text-foreground/70 hover:bg-foreground/10"
            }`}
          >
            Learned
          </button>
          <button
            onClick={onClose}
            className="shrink-0 rounded border border-foreground/20 text-foreground/70 px-1.5 py-0.5 hover:bg-foreground/10 transition-colors"
          >
            Close
          </button>
        </div>
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
            {swapped ? flipParity(parity) : parity}
          </button>
        ))}
      </div>
      <div ref={containerRef} className="h-80 w-full rounded overflow-hidden" />
      <div className="flex items-center gap-2">
        <span className="text-foreground/45">Speed</span>
        <input
          type="range"
          min={60}
          max={500}
          step={20}
          value={speedMs}
          onChange={(e) => setSpeedMs(Number(e.target.value))}
          className="flex-1 accent-accent"
        />
        <span className="text-foreground/45 w-14 text-right">{speedMs}ms/move</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-foreground">
          {alg.label}: {alg.sequence}
        </span>
        <button
          onClick={handlePlayOnPreview}
          disabled={previewBusy || !alg.sequence}
          className="shrink-0 rounded border border-accent/30 text-accent px-1.5 py-0.5 hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Play
        </button>
        <button
          onClick={handleResetPreview}
          disabled={previewBusy}
          className="shrink-0 rounded border border-foreground/20 text-foreground/70 px-1.5 py-0.5 hover:bg-foreground/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => onPlayAlg(alg.sequence)}
          disabled={playDisabled || !alg.sequence}
          className="shrink-0 rounded border border-foreground/20 text-foreground/70 px-1.5 py-0.5 hover:bg-foreground/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Play on cube
        </button>
      </div>
    </div>
  );
};
