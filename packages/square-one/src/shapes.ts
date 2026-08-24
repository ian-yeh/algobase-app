// Named CSP shapes a Square-1 layer can take, per cubingapp.com/algorithms/SQ1-CSP.
// A const object instead of `enum` - this repo builds with erasableSyntaxOnly,
// which disallows real TS enums since they emit runtime code.
export const Shape = {
  Barrel: "Barrel",
  Kite: "Kite",
  LeftFist: "Left Fist",
  RightFist: "Right Fist",
  LeftPawn: "Left Pawn",
  RightPawn: "Right Pawn",
  Muffin: "Muffin",
  Scallop: "Scallop",
  Shield: "Shield",
  Square: "Square",
  Star: "Star",
  PairedEdges: "Paired Edges",
  ParallelEdges: "Parallel Edges",
  PerpendicularEdges: "Perpendicular Edges",
  Left42: "Left 4-2",
  Right42: "Right 4-2",
  Left51: "Left 5-1",
  Right51: "Right 5-1",
  FourOneOne: "4-1-1",
  ThreeThree: "3-3",
  ThreeOneTwo: "3-1-2",
  ThreeTwoOne: "3-2-1",
  TwoTwoTwo: "2-2-2",
  FourFour: "4-4",
  FiveThree: "5-3",
  SevenOne: "7-1",
  Six: "6",
  SixTwo: "6-2",
  Eight: "8",
} as const;

export type Shape = (typeof Shape)[keyof typeof Shape];

import type { PieceKind } from "./square1";

// Canonical corner/edge run-length pattern per shape, e.g. "C2E1C4E1C2E2" means
// (going around the layer) 2 corner cells, 1 edge cell, 4 corner cells, 1 edge cell,
// 2 corner cells, 2 edge cells. Read clockwise as viewed from outside that layer (top
// from above, bottom from below - matching the physical viewing convention used
// elsewhere in this engine, e.g. renderer.ts's D-turn direction comment).
//
// Derived empirically: for each CSP_CASES entry, simulate the inverse of its solving
// algorithm from a solved cube (converting from the external "physical D" convention
// the algorithm data uses to this engine's internal D convention - see
// square1.utils.invertSequence and renderer.ts's turnBottom), then read the resulting
// layer's corner/edge pattern. All 90 cases agree with the single canonical pattern
// per shape below (up to rotation).
const SHAPE_PATTERNS: Record<Shape, string> = {
  [Shape.Barrel]: "C4E2C4E2",
  [Shape.Kite]: "C2E1C4E1C2E2",
  [Shape.LeftFist]: "C2E1C2E2C4E1",
  [Shape.RightFist]: "C2E1C2E1C4E2",
  [Shape.LeftPawn]: "C2E1C6E3",
  [Shape.RightPawn]: "C2E3C6E1",
  [Shape.Muffin]: "C4E1C4E3",
  [Shape.Scallop]: "C8E4",
  [Shape.Shield]: "C2E2C6E2",
  [Shape.Square]: "C2E1C2E1C2E1C2E1",
  [Shape.Star]: "C12",
  [Shape.PairedEdges]: "C10E2",
  [Shape.ParallelEdges]: "C4E1C6E1",
  [Shape.PerpendicularEdges]: "C2E1C8E1",
  [Shape.Left42]: "C2E2C4E4",
  [Shape.Right42]: "C2E4C4E2",
  [Shape.Left51]: "C2E1C4E5",
  [Shape.Right51]: "C2E5C4E1",
  [Shape.FourOneOne]: "C2E1C2E1C2E4",
  [Shape.ThreeThree]: "C2E3C4E3",
  [Shape.ThreeOneTwo]: "C2E1C2E2C2E3",
  [Shape.ThreeTwoOne]: "C2E1C2E3C2E2",
  [Shape.TwoTwoTwo]: "C2E2C2E2C2E2",
  [Shape.FourFour]: "C2E4C2E4",
  [Shape.FiveThree]: "C2E3C2E5",
  [Shape.SevenOne]: "C2E1C2E7",
  [Shape.Six]: "C6E6",
  [Shape.SixTwo]: "C2E2C2E6",
  [Shape.Eight]: "C4E8",
};

type Run = [PieceKind, number];

function decodePattern(encoded: string): Run[] {
  return [...encoded.matchAll(/([CE])(\d+)/g)].map(([, kind, count]) => [
    kind === "C" ? "corner" : "edge",
    Number(count),
  ]);
}

function runsOf(kinds: PieceKind[]): Run[] {
  const n = kinds.length;
  let start = 0;
  for (let i = 0; i < n; i++) {
    if (kinds[i] !== kinds[(i - 1 + n) % n]) {
      start = i;
      break;
    }
  }
  const ordered = Array.from({ length: n }, (_, i) => kinds[(start + i) % n]);

  const runs: Run[] = [];
  let count = 1;
  for (let i = 1; i < n; i++) {
    if (ordered[i] === ordered[i - 1]) {
      count++;
    } else {
      runs.push([ordered[i - 1], count]);
      count = 1;
    }
  }
  runs.push([ordered[n - 1], count]);
  return runs;
}

// Lexicographically smallest rotation, so two rotations of the same physical
// arrangement always compare equal.
function canonicalEncoding(runs: Run[]): string {
  const encode = (r: Run[]) => r.map(([kind, count]) => `${kind === "corner" ? "C" : "E"}${count}`).join("");
  let best: string | null = null;
  for (let i = 0; i < runs.length; i++) {
    const encoded = encode([...runs.slice(i), ...runs.slice(0, i)]);
    if (best === null || encoded < best) best = encoded;
  }
  return best ?? "";
}

const PATTERN_TO_SHAPE = new Map<string, Shape>(
  Object.entries(SHAPE_PATTERNS).map(([shape, pattern]) => [canonicalEncoding(decodePattern(pattern)), shape as Shape])
);

// Classifies a layer's corner/edge arrangement into its named CSP shape. `layer`
// controls read direction: bottom is reversed before matching because it's viewed
// from below (mirrored relative to top's array order) - see the module doc comment.
export function shapeFromLayerKinds(kinds: PieceKind[], layer: "top" | "bottom"): Shape | null {
  if (kinds.length !== 12) return null;
  const oriented = layer === "bottom" ? [...kinds].reverse() : kinds;
  return PATTERN_TO_SHAPE.get(canonicalEncoding(runsOf(oriented))) ?? null;
}
