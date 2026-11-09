import { useEffect, useRef, useState } from "react";
import {
  useSquare1Scene,
  CSP_CASES,
  invertSequence,
  parseSequenceTokens,
} from "@algobase/square-one";
import { Cube, traceOldPochmann } from "@algobase/three-by-three";
import { StaticCube } from "@/features/three-by-three/StaticCube";
import { StaticSquareOne } from "@/features/square-one/StaticSquareOne";
import { AlgThumb } from "@/features/alg-lists/AlgThumb";
import { sq1CaseSetup } from "@/lib/algList";

// Everything here pulls in three.js, so the landing page loads this module lazily.

const HERO_CASE = CSP_CASES.find((c) => c.id === "barrel-barrel")!;
const HERO_ALG = HERO_CASE.evenAlg!.sequence;
const HERO_LINES = [
  { label: "Setup", tokens: parseSequenceTokens(invertSequence(HERO_ALG)) },
  { label: "Solve", tokens: parseSequenceTokens(HERO_ALG) },
];
const MOVE_MS = 280;
const LINE_PAUSE_MS = 1100;

// Plays a CSP case's setup then its solving alg, forever, and highlights the move being played.
export const HeroSquareOne = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ line: 0, move: -1 });
  const posRef = useRef(pos);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playNext = () => {
    let { line, move } = posRef.current;
    move++;
    if (move >= HERO_LINES[line].tokens.length) {
      line = (line + 1) % HERO_LINES.length;
      move = 0;
    }
    posRef.current = { line, move };
    setPos(posRef.current);
    queueRef.current?.enqueueSequence(HERO_LINES[line].tokens[move], MOVE_MS);
  };

  const { queueRef } = useSquare1Scene(containerRef, {
    autoRotate: true,
    initialSequence: "",
    onMoveStart: () => {},
    onMoveComplete: () => {},
    onQueueEmpty: () => {
      const { line, move } = posRef.current;
      const endOfLine = move === HERO_LINES[line].tokens.length - 1;
      timeoutRef.current = setTimeout(playNext, endOfLine ? LINE_PAUSE_MS : 60);
    },
    onSliceBlocked: () => {},
  });

  useEffect(() => {
    timeoutRef.current = setTimeout(playNext, 600);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <figure className="m-0">
      {/* Drag-to-rotate would trap vertical scrolling on touch screens. */}
      <div ref={containerRef} className="plate aspect-square w-full max-md:pointer-events-none md:cursor-grab" />
      <figcaption className="mt-4 space-y-1.5 font-mono text-[13px] leading-relaxed">
        {HERO_LINES.map((l, li) => (
          <div key={l.label} className="flex gap-4">
            <span className="w-12 shrink-0 text-foreground/40">{l.label}</span>
            <span className="flex flex-wrap gap-x-1.5">
              {l.tokens.map((t, ti) => {
                const active = pos.line === li && pos.move === ti;
                return (
                  <span key={ti} className={active ? "text-accent" : li === pos.line && ti < pos.move ? "text-foreground" : "text-foreground/35"}>
                    {t}
                  </span>
                );
              })}
            </span>
          </div>
        ))}
      </figcaption>
    </figure>
  );
};

const CUBESHAPE_CASE = CSP_CASES.find((c) => c.id === "8-star")!;
export const CubeshapePlate = () => (
  <StaticSquareOne sequence={sq1CaseSetup(CUBESHAPE_CASE.evenAlg!.sequence)} className="plate h-56 w-full" />
);

const TRACE_SCRAMBLE = "R U F' L2 D B' R2 U' F2 L D2";
const TRACE = traceOldPochmann(Cube.createSolved().apply(TRACE_SCRAMBLE));
const pairs = (letters: string[]) => (letters.join("").match(/.{1,2}/g) ?? []).join(" ");

export const TracePlate = () => (
  <div className="plate">
    <StaticCube sequence={TRACE_SCRAMBLE} className="h-56 w-full" />
  </div>
);

export const TraceMemo = () => (
  <dl className="grid grid-cols-[4.5rem_1fr] gap-y-1 font-mono text-[13px]">
    <dt className="text-foreground/40">Edges</dt>
    <dd className="m-0">{pairs(TRACE.edges)}</dd>
    <dt className="text-foreground/40">Corners</dt>
    <dd className="m-0">{pairs(TRACE.corners)}</dd>
    <dt className="text-foreground/40">Parity</dt>
    <dd className="m-0">{TRACE.parity ? "yes" : "no"}</dd>
  </dl>
);

export const ALG_ROWS = [
  { name: "T perm", puzzle: "3x3", alg: "R U R' U' R' F R2 U' R' U' R U R' F'" },
  { name: "Sune", puzzle: "3x3", alg: "R U R' U R U2 R'" },
  { name: "Kite / Kite", puzzle: "sq1", alg: "-3,3 / -2,-1 / 2,-2 / -2,2 / -1,-2 / -3,-3 /" },
] as const;

export const AlgRows = () => (
  <ul className="divide-y divide-line border-y border-line">
    {ALG_ROWS.map((r) => (
      <li key={r.name} className="flex items-center gap-4 py-3">
        <AlgThumb puzzle={r.puzzle} alg={r.alg} topColor="yellow" className="h-14 w-14 shrink-0" />
        <div className="min-w-0">
          <div className="text-sm font-medium">{r.name}</div>
          <div className="truncate font-mono text-[13px] text-foreground/50">{r.alg}</div>
        </div>
      </li>
    ))}
  </ul>
);
