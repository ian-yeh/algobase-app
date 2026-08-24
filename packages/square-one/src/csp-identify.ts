import { Square } from "./square1";
import { invertSequence, toEngineConvention } from "./square1.utils";
import { shapeFromLayerKinds } from "./shapes";
import { CSP_CASES, type CspCase } from "./csp-cases";
import type { PresetAlgorithm } from "./presets";

export type CspParity = "even" | "odd";

// Some cases have no algorithm for one parity - the shape is already in cube shape for that parity, so there's nothing to do before PBL. square-square/odd is the only case missing an alg today: even parity there means the puzzle is already cube-shaped.
export const NOTHING_ALG: PresetAlgorithm = {
  label: "Nothing (already in cube shape)",
  sequence: "",
};

export function getCspAlg(cspCase: CspCase, parity: CspParity): PresetAlgorithm {
  return (parity === "even" ? cspCase.evenAlg : cspCase.oddAlg) ?? NOTHING_ALG;
}

export interface CspIdentification {
  cspCase: CspCase;
  parity: CspParity;
  alg: PresetAlgorithm;
  // The state matched the case's shape pair swapped top-for-bottom.
  flipped: boolean;
  // Whether `parity` was confirmed by actually solving the live state (true), vs.
  // just defaulted because the state was a flipped shape match (false) - see below.
  parityKnown: boolean;
}

// CSP_CASES algorithm strings are sourced externally (cubingapp.com) in the same
// "physical" D convention as the rest of the app - see square1.utils.physicalToEngineD.

// The setup that reaches this case's canonical (unrotated) orientation from solved - the inverse of its solving algorithm, in engine convention. Used to show a "reference scheme": replay it from solved to see what the case looks like before any AUF-style rotation, for comparison against the live (arbitrarily rotated) scramble.
export function getReferenceSetup(alg: PresetAlgorithm): string {
  return toEngineConvention(invertSequence(alg.sequence));
}

// A flipped shape match means the live square's top/bottom shapes are case C's shapes with top and bottom swapped - a direct match for C from the other side of the puzzle. Physically turning the whole puzzle over would make it a direct match; in array terms that's swapping the top/bottom layers and reversing each (bottom's shape reading is already mirrored relative to top's - see shapeFromLayerKinds - so un-swapping needs the same mirroring). Verified empirically against all 90 CSP_CASES: flipping a case's own reference scheme and flipping it back reproduces the original state exactly, for arbitrary rotate/slice sequences.
function flipSquare(square: Square): Square {
  return new Square(
    square.getBottomLayer().slice().reverse(),
    square.getTopLayer().slice().reverse(),
    square.getEquatorHalves()
  );
}

// Circular distance of a 30-degree-step rotation from 0, e.g. 11 -> 1 (it's really -1).
function rotationDistance(steps: number): number {
  const s = ((steps % 12) + 12) % 12;
  return Math.min(s, 12 - s);
}

// A solving algorithm's move sequence is written for one specific starting rotation of the top/bottom layers. A scramble reaches the same shape at an arbitrary rotation of each layer independently (like needing an AUF before OLL/PLL), so before checking whether an algorithm solves the state, try every combination of pre-rotating the top and bottom layers by 0-11 30-degree steps. Some shapes (e.g. Star, which is all corners) have enough internal symmetry that more than one (algorithm, rotation) pair can reach solved for the same physical state - when that happens the smallest total rotation is the intended alignment, since the reference algorithms assume little to no pre-rotation.
function bestAlignmentDistance(square: Square, engineSequence: string): number | null {
  let best: number | null = null;
  for (let u0 = 0; u0 < 12; u0++) {
    for (let d0 = 0; d0 < 12; d0++) {
      if (best !== null && rotationDistance(u0) + rotationDistance(d0) >= best) continue;
      const attempt = square.clone();
      attempt.rotate(u0, d0);
      if (attempt.executeSequence(engineSequence) && attempt.isSolved()) {
        const distance = rotationDistance(u0) + rotationDistance(d0);
        if (best === null || distance < best) best = distance;
      }
    }
  }
  return best;
}

// Identifies which CSP case a shaped (but not necessarily solved) Square is in - a shape similarity search, not a permutation solve. Matches the layers' shape pair (rotation-invariant) against CSP_CASES, in either top/bottom order (a scramble can show a case's shape pair flipped top-for-bottom). Parity (even vs odd) is determined by actually solving the live state: try each parity's algorithm against every top/bottom pre-rotation (and, for a flipped match, against the puzzle turned over - see flipSquare) and see which one reaches solved; if neither finds a solve, parity defaults to whichever algorithm exists and is reported as unconfirmed via `parityKnown`.
export function identifyCspCase(square: Square): CspIdentification | null {
  const topShape = shapeFromLayerKinds(square.getTopLayerKinds(), "top");
  const bottomShape = shapeFromLayerKinds(square.getBottomLayerKinds(), "bottom");
  if (!topShape || !bottomShape) return null;

  const direct = CSP_CASES.find((c) => c.topShape === topShape && c.bottomShape === bottomShape);
  const cspCase = direct ?? CSP_CASES.find((c) => c.topShape === bottomShape && c.bottomShape === topShape);
  if (!cspCase) return null;
  const flipped = !direct;
  const searchSquare = flipped ? flipSquare(square) : square;

  const candidates: [CspParity, PresetAlgorithm][] = [
    ["even", getCspAlg(cspCase, "even")],
    ["odd", getCspAlg(cspCase, "odd")],
  ];

  let winner: CspIdentification | null = null;
  let winnerDistance = Infinity;
  for (const [parity, alg] of candidates) {
    const distance = bestAlignmentDistance(searchSquare, toEngineConvention(alg.sequence));
    if (distance !== null && distance < winnerDistance) {
      winner = { cspCase, parity, alg, flipped, parityKnown: true };
      winnerDistance = distance;
    }
  }
  if (winner) return winner;

  const parity: CspParity = cspCase.evenAlg ? "even" : "odd";
  return { cspCase, parity, alg: getCspAlg(cspCase, parity), flipped, parityKnown: false };
}
