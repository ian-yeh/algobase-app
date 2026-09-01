import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuthStore } from "@/stores/authStore";
import { flipParity, getEffectiveCspAlg, type CspCustomization } from "@/lib/cspCustomAlg";
import { cspCaseWeight, loadCspStats, recordCspResult, type CspStatsMap } from "@/lib/cspRecallStats";
import {
  CSP_CASES,
  invertSequence,
  parseSequenceTokens,
  useSquare1Scene,
  type CspCase,
  type CspParity,
  type PresetAlgorithm,
} from "@algobase/square-one";

const noop = () => {};

interface Round {
  cspCase: CspCase;
  parity: CspParity;
}

function availableParities(cspCase: CspCase): CspParity[] {
  return (["even", "odd"] as const).filter((p) => (p === "even" ? cspCase.evenAlg : cspCase.oddAlg));
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// One shuffled pass over the whole pool (random parity) so a large pool
// doesn't repeat cases immediately. `weight` lets a case appear more than
// once per pass - used to resurface cases the user tends to get wrong.
function freshBag(pool: CspCase[], weight: (cspCase: CspCase) => number = () => 1): Round[] {
  const entries: Round[] = [];
  for (const cspCase of pool) {
    const parities = availableParities(cspCase);
    const copies = Math.max(1, Math.round(weight(cspCase)));
    for (let i = 0; i < copies; i++) {
      entries.push({ cspCase, parity: parities[Math.floor(Math.random() * parities.length)] });
    }
  }
  return shuffle(entries);
}

// A non-zero rotation of the top/bottom layers, appended after a case's setup
// so the printed sequence isn't recognizable as "the reverse of algorithm X"
// to someone who has that algorithm memorized. Must come *after* the setup,
// not before: turns before a slice combine additively, so a rotation
// prepended before the setup's first move would shift the turn amount at its
// first slice point and could reach the wrong shape or block the slice
// entirely. A trailing rotation with no slice after it can never affect
// legality and doesn't change the shape/parity (both rotation-invariant).
function randomSetupRotation(): [u: number, d: number] {
  let u = 0;
  let d = 0;
  while (u === 0 && d === 0) {
    u = Math.floor(Math.random() * 12) - 5;
    d = Math.floor(Math.random() * 12) - 5;
  }
  return [u, d];
}

// Appends the disguise rotation to a setup sequence. If the sequence already
// ends in a bare turn (no slice after it), merges into that turn instead of
// printing a second turn token right after it with nothing between them -
// two turns with no slice between them are one physical move, so they should
// read as one combined number, not an ambiguous pair.
function appendDisguiseRotation(setupSequence: string): string {
  const tokens = parseSequenceTokens(setupSequence);
  const [du, dd] = randomSetupRotation();
  const last = tokens[tokens.length - 1];
  const match = last?.match(/^(-?\d+),(-?\d+)$/);
  if (match) {
    tokens[tokens.length - 1] = `${Number(match[1]) + du},${Number(match[2]) + dd}`;
  } else {
    tokens.push(`${du},${dd}`);
  }
  return tokens.join(' ');
}

const algText = (alg: PresetAlgorithm) => alg.sequence || alg.label;

interface ChoiceOption {
  text: string;
  correct: boolean;
}

// 4 choices. When this case has an algorithm for the *other* parity too (same
// shape, different parity - they look identical), that sibling algorithm is
// always one of the decoys - otherwise the question only tests "recognize
// this cube shape", not "tell the two parities of this shape apart", which is
// the actual skill.
function buildChoices(
  cspCase: CspCase,
  correctParity: CspParity,
  correctAlg: PresetAlgorithm,
  customization: CspCustomization | null
): ChoiceOption[] {
  const correctText = algText(correctAlg);
  const siblingParity: CspParity = correctParity === "even" ? "odd" : "even";
  const hasSibling = siblingParity === "even" ? !!cspCase.evenAlg : !!cspCase.oddAlg;
  const siblingText = hasSibling ? algText(getEffectiveCspAlg(cspCase, siblingParity, customization)) : null;

  const decoys: string[] = [];
  if (siblingText && siblingText !== correctText) decoys.push(siblingText);

  const otherAlgs = shuffle(
    CSP_CASES.flatMap((c) => [c.evenAlg, c.oddAlg])
      .filter((a): a is PresetAlgorithm => !!a)
      .map(algText)
  );
  for (const text of otherAlgs) {
    if (decoys.length >= 3) break;
    if (text !== correctText && !decoys.includes(text)) decoys.push(text);
  }

  return shuffle([{ text: correctText, correct: true }, ...decoys.map((text) => ({ text, correct: false }))]);
}

type Tab = "algorithm" | "practice";

const SquareOneCspRecall = () => {
  const token = useAuthStore((s) => s.token);
  const progress = useQuery(api.cspProgress.getCspProgress, token ? { token } : "skip");
  const customizations = useQuery(api.cspCustomization.getCspCustomizations, token ? { token } : "skip");

  const pool = useMemo(() => CSP_CASES.filter((c) => progress?.[c.id]), [progress]);
  const [tab, setTab] = useState<Tab>("algorithm");

  if (!token) {
    return <div className="max-w-3xl mx-auto py-10 px-4 text-sm text-foreground/45">Sign in to use the recall trainer.</div>;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-xl mx-auto py-10 px-4">
        <Link to="/training/square1-csp" className="text-sm text-foreground/45 hover:text-foreground mb-6 inline-block">
          &larr; Back to Square-1 CSP
        </Link>
        <h1 className="text-2xl font-semibold mb-4">CSP Recall Trainer</h1>

        <div className="flex items-center gap-1 mb-6 text-sm">
          <TabButton active={tab === "algorithm"} onClick={() => setTab("algorithm")}>
            Algorithm test
          </TabButton>
          <TabButton active={tab === "practice"} onClick={() => setTab("practice")}>
            Case practice
          </TabButton>
        </div>

        {tab === "algorithm" ? (
          // Given the case + parity outright (as if already traced), pick the correct
          // algorithm out of 4 choices. Multiple choice, not free recall, so it's
          // gradeable without any notation-matching guesswork. Just keeps going -
          // no session/round count, draws from the shuffle-bag forever.
          <DrillTab
            pool={pool}
            customizations={customizations}
            blurb="You're shown a case's shape and parity outright (as if you'd already traced it) and pick the right
              algorithm from 4 choices. Cases you get wrong come up more often. Keys: 1-4 to answer, Enter for next."
            renderCard={(round, customization, onNext) => (
              <MultipleChoiceRound round={round} customization={customization} onNext={onNext} />
            )}
          />
        ) : (
          // Drills random learned cases with a fresh physical setup each round - no 3D
          // model, no answer shown up front. Apply the setup to your own cube, trace
          // it, and decide even or odd yourself, then reveal to check. Getting parity
          // (misjudging even/odd, or applying the wrong algorithm for it) counts as a
          // miss and resurfaces the case more often; a clean match counts as a hit.
          <DrillTab
            pool={pool}
            customizations={customizations}
            blurb="Apply the setup to your own cube, trace it, and decide even or odd yourself. Reveal to check - a
              parity miss (wrong even/odd, or the wrong algorithm for it) comes up more often. Keys: Space to reveal,
              then 1 if you traced it right, 2 if you missed."
            renderCard={(round, customization, onNext) => (
              <TracePracticeCard round={round} customization={customization} onNext={onNext} />
            )}
          />
        )}
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({
  active,
  onClick,
  children,
}) => (
  <button
    onClick={onClick}
    className={`rounded px-3 py-1.5 transition-colors ${
      active ? "bg-accent/10 text-accent border border-accent/30" : "text-foreground/45 hover:text-foreground border border-transparent"
    }`}
  >
    {children}
  </button>
);

// Endless weighted shuffle-bag drill: draws rounds from the learned pool,
// records right/wrong per case, and hands each round to `renderCard`.
const DrillTab: React.FC<{
  pool: CspCase[];
  customizations: Record<string, CspCustomization> | undefined;
  blurb: string;
  renderCard: (round: Round, customization: CspCustomization | null, onNext: (correct: boolean) => void) => React.ReactNode;
}> = ({ pool, customizations, blurb, renderCard }) => {
  const queueRef = useRef<Round[]>([]);
  const statsRef = useRef<CspStatsMap>(loadCspStats());
  const [round, setRound] = useState<Round | null>(null);

  const draw = useCallback(() => {
    if (queueRef.current.length === 0) {
      queueRef.current = freshBag(pool, (c) => cspCaseWeight(statsRef.current, c.id));
    }
    setRound(queueRef.current.shift() ?? null);
  }, [pool]);

  useEffect(() => {
    queueRef.current = [];
    draw();
  }, [draw]);

  if (pool.length === 0) {
    return (
      <p className="text-sm text-foreground/45">
        No cases in your pool yet -{" "}
        <Link to="/training/square1-csp" className="underline hover:text-foreground">
          mark some "Learned"
        </Link>{" "}
        first.
      </p>
    );
  }

  if (!round) return null;

  return (
    <div className="space-y-4 text-sm">
      <p className="text-foreground/70">{blurb}</p>
      {renderCard(round, customizations?.[round.cspCase.id] ?? null, (correct) => {
        statsRef.current = recordCspResult(statsRef.current, round.cspCase.id, correct);
        draw();
      })}
    </div>
  );
};

const MultipleChoiceRound: React.FC<{
  round: Round;
  customization: CspCustomization | null;
  onNext: (correct: boolean) => void;
}> = ({ round, customization, onNext }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const swapped = customization?.swapped ?? false;
  const displayedParity = swapped ? flipParity(round.parity) : round.parity;
  // Choices are shuffled once per round and must not reshuffle on re-render
  // (e.g. after the user clicks an option) - depend only on values that
  // identify the round, not on the alg's object identity.
  const choices = useMemo(
    () => buildChoices(round.cspCase, round.parity, getEffectiveCspAlg(round.cspCase, round.parity, customization), customization),
    [round, customization]
  );
  const [selected, setSelected] = useState<number | null>(null);

  // Grey (monochrome) so nothing here reads as a color cue - shape/parity
  // recognition only, matching the actual skill being tested.
  const { queueRef } = useSquare1Scene(containerRef, {
    autoRotate: false,
    monochrome: true,
    initialSequence: "",
    onMoveStart: noop,
    onMoveComplete: noop,
    onQueueEmpty: noop,
    onSliceBlocked: noop,
  });

  // One persistent scene, re-posed per round - remounting the WebGL renderer
  // every answer makes the drill loop jank.
  useEffect(() => {
    const queue = queueRef.current;
    if (!queue) return;
    const sequence = getEffectiveCspAlg(round.cspCase, round.parity, customization).sequence;
    queue.clear();
    queue.resetState();
    if (sequence) queue.applyInstant(invertSequence(sequence));
    setSelected(null);
  }, [round, customization, queueRef]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const digit = Number(e.key);
      if (selected === null && digit >= 1 && digit <= choices.length) {
        e.preventDefault();
        setSelected(digit - 1);
      } else if (selected !== null && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onNext(choices[selected].correct);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choices, selected, onNext]);

  return (
    <div className="flex flex-col rounded-lg border border-foreground/10 p-3 text-sm font-mono space-y-3">
      <div ref={containerRef} className="h-72 w-full rounded overflow-hidden" />
      <div className="text-foreground/70">
        Case: <span className="text-foreground">{round.cspCase.topShape}</span> /{" "}
        <span className="text-foreground">{round.cspCase.bottomShape}</span>, parity{" "}
        <span className="text-foreground">{displayedParity}</span>
      </div>
      <div className="space-y-2">
        {choices.map((choice, i) => {
          const revealed = selected !== null;
          const stateClass = !revealed
            ? "border-foreground/20 hover:border-accent/30"
            : choice.correct
              ? "border-green-500/40 bg-green-500/10 text-green-500"
              : selected === i
                ? "border-red-500/40 bg-red-500/10 text-red-500"
                : "border-foreground/10 text-foreground/40";
          return (
            <button
              key={i}
              onClick={() => setSelected((s) => s ?? i)}
              disabled={revealed}
              className={`w-full text-left rounded border px-4 py-3 text-base transition-colors disabled:cursor-default ${stateClass}`}
            >
              <span className="text-foreground/40 mr-2">{i + 1}</span>
              {choice.text}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <button
          onClick={() => onNext(choices[selected].correct)}
          className="self-start rounded border border-foreground/20 text-foreground/70 px-2 py-1 hover:bg-foreground/10 transition-colors"
        >
          Next (enter)
        </button>
      )}
    </div>
  );
};

const TracePracticeCard: React.FC<{ round: Round; customization: CspCustomization | null; onNext: (correct: boolean) => void }> = ({
  round,
  customization,
  onNext,
}) => {
  const swapped = customization?.swapped ?? false;
  const alg = getEffectiveCspAlg(round.cspCase, round.parity, customization);
  // Setup sequence in physical convention, exactly as the user would perform it on their own
  // cube - suffixed with a random rotation so it doesn't just read as "invert(alg)" to anyone
  // who has the algorithm memorized. Keyed on the round so a case repeating back-to-back
  // still gets a fresh disguise.
  const setupSequence = useMemo(
    () => appendDisguiseRotation(invertSequence(getEffectiveCspAlg(round.cspCase, round.parity, customization).sequence)),
    [round, customization]
  );

  const [revealed, setRevealed] = useState(false);
  useEffect(() => setRevealed(false), [round]);
  const displayedParity = swapped ? flipParity(round.parity) : round.parity;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (!revealed && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed && (e.key === "1" || e.key === "2")) {
        e.preventDefault();
        onNext(e.key === "1");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, onNext]);

  return (
    <div className="flex flex-col rounded-lg border border-foreground/10 p-3 text-sm font-mono space-y-3">
      <div className="text-xs text-foreground/45">
        Setup on your cube: <span className="text-foreground">{setupSequence}</span>
      </div>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="self-start rounded border border-accent/30 text-accent px-2 py-1 hover:bg-accent/10 transition-colors"
        >
          Reveal (space)
        </button>
      ) : (
        <div className="space-y-2">
          <div className="text-foreground/70">
            {round.cspCase.topShape} / {round.cspCase.bottomShape}, parity{" "}
            <span className="text-foreground">{displayedParity}</span>
          </div>
          <div className="text-foreground/45 text-xs pt-1">Algorithm</div>
          <div className="text-foreground">{alg.sequence || alg.label}</div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onNext(true)}
              className="rounded border border-green-500/40 text-green-500 px-2 py-1 hover:bg-green-500/10 transition-colors"
            >
              Traced it right (1)
            </button>
            <button
              onClick={() => onNext(false)}
              className="rounded border border-red-500/40 text-red-500 px-2 py-1 hover:bg-red-500/10 transition-colors"
            >
              Missed it (2)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SquareOneCspRecall;
