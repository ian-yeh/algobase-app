import { useEffect, useRef, useState } from "react";
import { useCubeScene } from "@algobase/three-by-three";
import { useSquare1Scene, invertSequence } from "@algobase/square-one";
import { algMoves, cubeCaseSetup, sq1CaseAlignment, type Puzzle, type TopColor } from "@/lib/algList";

// The subset both puzzle queues share.
interface Queue {
  clear(): void;
  resetState(): void;
  applyInstant(sequence: string): void;
  enqueueSequence(sequence: string, durationPerMoveMs?: number): void;
}

interface SceneProps {
  setup: string;
  queueOut: React.RefObject<Queue | null>;
  onMoveStart: () => void;
  onMoveComplete: () => void;
  onQueueEmpty: () => void;
}

const SCENE_CLASS = "h-80 w-full rounded overflow-hidden";

const CubeScene = ({ setup, queueOut, ...callbacks }: SceneProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { queueRef } = useCubeScene(containerRef, { autoRotate: false, initialSequence: setup, ...callbacks });
  useEffect(() => {
    queueOut.current = queueRef.current;
  });
  return <div ref={containerRef} className={SCENE_CLASS} />;
};

const Sq1Scene = ({ setup, queueOut, ...callbacks }: SceneProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { queueRef } = useSquare1Scene(containerRef, {
    autoRotate: false,
    initialSequence: setup,
    onSliceBlocked: () => {},
    ...callbacks,
  });
  useEffect(() => {
    queueOut.current = queueRef.current;
  });
  return <div ref={containerRef} className={SCENE_CLASS} />;
};

const MOVE_MS = 250;

// Starts in the case state and plays the alg down to solved. Pause stops after the move in flight.
export const AlgPlayer: React.FC<{ puzzle: Puzzle; alg: string; topColor: TopColor }> = ({ puzzle, alg, topColor }) => {
  const queueRef = useRef<Queue | null>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);

  // The sq1 queue converts to engine convention itself, so it takes physical (negated D) sequences.
  const [u, d] = (puzzle === "sq1" && sq1CaseAlignment(alg)) || [0, 0];
  const setup = puzzle === "3x3" ? cubeCaseSetup(alg, topColor) : `${u},${-d} ${invertSequence(alg)}`;
  // Plus the final layer adjustment the alg leaves implied, so playback ends visibly solved.
  const moves = [...algMoves(puzzle, alg), ...(u || d ? [`(${-u},${d})`] : [])];

  const setIndexBoth = (i: number) => {
    indexRef.current = i;
    setIndex(i);
  };

  const restart = () => {
    const queue = queueRef.current;
    if (!queue) return;
    queue.clear();
    queue.resetState();
    queue.applyInstant(setup);
    setIndexBoth(0);
  };

  const play = () => {
    const queue = queueRef.current;
    if (!queue) return;
    const from = indexRef.current >= moves.length ? 0 : indexRef.current;
    if (from === 0) restart();
    moves.slice(from).forEach((move) => queue.enqueueSequence(move, MOVE_MS));
    setPlaying(true);
  };

  const pause = () => {
    queueRef.current?.clear();
    setPlaying(false);
  };

  const sceneProps: SceneProps = {
    setup,
    queueOut: queueRef,
    onMoveStart: () => setBusy(true),
    onMoveComplete: () => setIndexBoth(indexRef.current + 1),
    onQueueEmpty: () => {
      setBusy(false);
      setPlaying(false);
    },
  };

  const button =
    "rounded border px-2 py-1 text-xs font-mono transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="space-y-3">
      {puzzle === "3x3" ? <CubeScene {...sceneProps} /> : <Sq1Scene {...sceneProps} />}
      <div className="flex items-center gap-2">
        {playing ? (
          <button onClick={pause} className={`${button} border-accent/30 text-accent hover:bg-accent/10`}>
            Pause
          </button>
        ) : (
          <button onClick={play} disabled={busy} className={`${button} border-accent/30 text-accent hover:bg-accent/10`}>
            Play
          </button>
        )}
        <button
          onClick={restart}
          disabled={busy}
          className={`${button} border-foreground/20 text-foreground/70 hover:bg-foreground/10`}
        >
          Restart
        </button>
        <span className="ml-auto text-xs font-mono text-foreground/45">
          {index} / {moves.length}
        </span>
      </div>
      <div className="text-sm font-mono break-words">
        {moves.map((move, i) => (
          <span key={i} className={i < index ? "text-foreground/35" : "text-foreground"}>
            {move}{" "}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AlgPlayer;
