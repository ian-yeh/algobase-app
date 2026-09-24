import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SPEFFZ } from "@algobase/three-by-three";

const buttonClass =
  "rounded border border-foreground/20 text-foreground/70 px-3 py-1.5 text-sm hover:bg-foreground/10 transition-colors disabled:opacity-30 disabled:pointer-events-none";
const primaryButtonClass =
  "rounded border border-accent/30 text-accent px-3 py-1.5 text-sm hover:bg-accent/10 transition-colors";

const PRESET_COUNTS = [6, 10, 14, 20];

// One concrete, imageable word per Speffz letter. The hint for a pair is just its two words said
// together - a cheap stand-in for the full person/action systems serious BLD memo uses, but enough
// to turn "R Q" into a picture ("Robot Queen") worth remembering.
const LETTER_WORDS: Record<string, string> = {
  A: "Astronaut", B: "Banana", C: "Captain", D: "Dragon", E: "Elephant", F: "Falcon", G: "Guitar", H: "Hammer",
  I: "Igloo", J: "Jaguar", K: "Kangaroo", L: "Lantern", M: "Mummy", N: "Ninja", O: "Octopus", P: "Pirate",
  Q: "Queen", R: "Robot", S: "Shark", T: "Tiger", U: "Umbrella", V: "Viking", W: "Wizard", X: "Xylophone",
};

const hintFor = (pair: string[]) => pair.map((l) => LETTER_WORDS[l]).join(" ");

const randomLetters = (count: number): string[] =>
  Array.from({ length: count }, () => SPEFFZ[Math.floor(Math.random() * SPEFFZ.length)]);

const chunkPairs = (letters: string[]): string[][] => {
  const pairs: string[][] = [];
  for (let i = 0; i < letters.length; i += 2) pairs.push(letters.slice(i, i + 2));
  return pairs;
};

type Phase = "setup" | "memo" | "recall";

const ThreeBldMemo = () => {
  const [phase, setPhase] = useState<Phase>("setup");
  const [count, setCount] = useState(10);
  const [letters, setLetters] = useState<string[]>([]);
  const [pairIndex, setPairIndex] = useState(0);
  const [recallInput, setRecallInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [hintOn, setHintOn] = useState(false);

  const pairs = useMemo(() => chunkPairs(letters), [letters]);

  useEffect(() => setHintOn(false), [pairIndex]);

  const start = () => {
    setLetters(randomLetters(count));
    setPairIndex(0);
    setRecallInput("");
    setChecked(false);
    setPhase("memo");
  };

  // Arrow keys mirror the on-screen prev/next buttons during memorization.
  useEffect(() => {
    if (phase !== "memo") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setPairIndex((i) => Math.min(i + 1, pairs.length - 1));
      else if (e.key === "ArrowLeft") setPairIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, pairs.length]);

  const normalizedInput = recallInput.replace(/[^a-zA-Z]/g, "").toUpperCase();
  const correctCount = letters.filter((l, i) => normalizedInput[i] === l).length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-xl mx-auto py-10 px-4">
        <Link to="/training" className="text-sm text-foreground/45 hover:text-foreground mb-6 inline-block">
          &larr; Back to Training
        </Link>
        <h1 className="text-2xl font-semibold mb-4">Letter Memo Trainer</h1>
        <p className="text-sm text-foreground/70 mb-6">
          Practice memorizing Speffz letters the way you would a real 3BLD memo: step through random
          letters two at a time (a "pair"), then recall the full sequence from memory.
        </p>

        {phase === "setup" && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2">
              <label className="text-foreground/70">Letters to practice</label>
              <input
                type="number"
                min={2}
                max={40}
                value={count}
                onChange={(e) => setCount(Math.max(2, Math.min(40, Number(e.target.value) || 2)))}
                className="w-20 rounded border border-foreground/20 bg-transparent px-2 py-1 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              {PRESET_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`${buttonClass} ${count === n ? "border-accent/30 text-accent" : ""}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button onClick={start} className={primaryButtonClass}>
              Start
            </button>
          </div>
        )}

        {phase === "memo" && pairs.length > 0 && (
          <div className="space-y-6 text-center">
            <div className="text-sm text-foreground/45">
              Pair {pairIndex + 1} of {pairs.length}
            </div>
            <div className="text-6xl font-mono font-semibold tracking-widest pt-12 pb-4">
              {pairs[pairIndex].join(" ")}
            </div>
            <div className="h-6 text-sm text-foreground/45">
              {hintOn ? hintFor(pairs[pairIndex]) : (
                <button onClick={() => setHintOn(true)} className="underline hover:text-foreground transition-colors">
                  Show hint
                </button>
              )}
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPairIndex((i) => Math.max(i - 1, 0))}
                disabled={pairIndex === 0}
                className={buttonClass}
              >
                &larr; Prev
              </button>
              <button
                onClick={() => setPairIndex((i) => Math.min(i + 1, pairs.length - 1))}
                disabled={pairIndex === pairs.length - 1}
                className={buttonClass}
              >
                Next &rarr;
              </button>
            </div>
            <button onClick={() => setPhase("recall")} className={primaryButtonClass}>
              Recall
            </button>
          </div>
        )}

        {phase === "recall" && (
          <div className="space-y-4 text-sm">
            <p className="text-foreground/70">Type the full sequence of {letters.length} letters from memory.</p>
            <input
              value={recallInput}
              onChange={(e) => {
                setRecallInput(e.target.value);
                setChecked(false);
              }}
              placeholder="Your recall"
              className="w-full rounded border border-foreground/20 bg-transparent px-3 py-2 font-mono tracking-widest outline-none"
              autoFocus
            />
            {!checked ? (
              <button onClick={() => setChecked(true)} className={primaryButtonClass}>
                Check
              </button>
            ) : (
              <div className="space-y-3">
                <div className="font-mono text-lg tracking-widest">
                  {letters.map((letter, i) => (
                    <span key={i} className={normalizedInput[i] === letter ? "text-green-500" : "text-red-500"}>
                      {letter}
                    </span>
                  ))}
                </div>
                <div className="text-foreground/70">
                  {correctCount} / {letters.length} correct
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={start} className={buttonClass}>
                    New set
                  </button>
                  <button onClick={() => setPhase("setup")} className={buttonClass}>
                    Change count
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreeBldMemo;
