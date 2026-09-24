import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { generateScramble, opAlgForLetter, traceOldPochmann, useCubeScene, type PieceType } from "@algobase/three-by-three";

const noop = () => {};

const TURN_DURATION_MS = 75;

const buttonClass =
  "rounded border border-foreground/20 text-foreground/70 px-3 py-1.5 text-sm hover:bg-foreground/10 transition-colors";

const normalize = (s: string) => s.replace(/[^a-zA-Z]/g, "").toUpperCase();

type TraceStatus = "empty" | "correct" | "incorrect";

function traceStatus(input: string, correct: string[]): TraceStatus {
  const norm = normalize(input);
  if (!norm) return "empty";
  return norm === correct.join("") ? "correct" : "incorrect";
}

const inputClass = (status: TraceStatus) =>
  `rounded border bg-transparent px-3 py-1.5 text-sm outline-none w-40 transition-colors ${
    status === "correct"
      ? "border-green-500 text-green-600"
      : status === "incorrect"
        ? "border-red-500 text-red-600"
        : "border-foreground/20 text-foreground/70"
  }`;

const ThreeBldTrace = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { queueRef } = useCubeScene(containerRef, {
    autoRotate: false,
    initialSequence: "",
    onMoveStart: noop,
    onMoveComplete: noop,
    onQueueEmpty: noop,
  });
  const [lettersOn, setLettersOn] = useState(false);
  const [edgeInput, setEdgeInput] = useState("");
  const [cornerInput, setCornerInput] = useState("");
  const prevEdgeNorm = useRef("");
  const prevCornerNorm = useRef("");

  // Executes setup + swap + undo-setup for each letter newly appended to the input, live on the
  // cube - so typing a memo out plays it, letter by letter, like actually solving.
  const runNewLetters = (norm: string, prevRef: React.RefObject<string>, type: PieceType) => {
    if (norm.startsWith(prevRef.current)) {
      for (const letter of norm.slice(prevRef.current.length)) {
        const alg = opAlgForLetter(letter, type);
        if (alg) queueRef.current?.enqueueSequence(alg, TURN_DURATION_MS);
      }
    }
    prevRef.current = norm;
  };

  const scramble = () => queueRef.current?.enqueueSequence(generateScramble(), TURN_DURATION_MS);
  const reset = () => queueRef.current?.resetState();
  const toggleLetters = () => {
    const next = !lettersOn;
    setLettersOn(next);
    queueRef.current?.setLabelsVisible(next);
  };

  const memo = queueRef.current ? traceOldPochmann(queueRef.current.getState()) : null;
  const edgeStatus = memo ? traceStatus(edgeInput, memo.edges) : "empty";
  const cornerStatus = memo ? traceStatus(cornerInput, memo.corners) : "empty";

  return (
    <div className="relative h-full w-full">
      <Link
        to="/training"
        className="absolute top-4 left-4 text-sm text-foreground/45 hover:text-foreground transition-colors"
      >
        &larr; Back to Training
      </Link>
      <div ref={containerRef} className="h-full w-full" />
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <input
          value={edgeInput}
          onChange={(e) => {
            setEdgeInput(e.target.value);
            runNewLetters(normalize(e.target.value), prevEdgeNorm, "edge");
          }}
          placeholder="Edge trace"
          className={inputClass(edgeStatus)}
        />
        <input
          value={cornerInput}
          onChange={(e) => {
            setCornerInput(e.target.value);
            runNewLetters(normalize(e.target.value), prevCornerNorm, "corner");
          }}
          placeholder="Corner trace"
          className={inputClass(cornerStatus)}
        />
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <button onClick={reset} className={buttonClass}>
          Reset
        </button>
        <button onClick={scramble} className={buttonClass}>
          Scramble
        </button>
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          Letters
          <button
            role="switch"
            aria-checked={lettersOn}
            onClick={toggleLetters}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              lettersOn ? "bg-green-500" : "bg-foreground/20"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                lettersOn ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </label>
      </div>
    </div>
  );
};

export default ThreeBldTrace;
