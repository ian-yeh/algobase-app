import { Cube, invertAlg, parseAlg } from "@algobase/three-by-three";
import { Square, invertSequence, parseSequenceTokens, toEngineConvention } from "@algobase/square-one";

export type Puzzle = "3x3" | "sq1";
export type TopColor = "white" | "yellow";

// Anything left after removing every valid Square-1 token is junk the tokenizer would silently skip.
const SQ1_TOKEN = /\(\s*-?\d+\s*,\s*-?\d+\s*\)|-?\d+\s*,\s*-?\d+|\//g;

// Returns an error message, or null if `alg` parses and (for sq1) every slice is legal from its case.
export function validateAlg(puzzle: Puzzle, alg: string): string | null {
  if (!alg.trim()) return "Enter an algorithm";
  try {
    if (puzzle === "3x3") {
      Cube.createSolved().apply(alg);
      return null;
    }
    const junk = alg.replace(SQ1_TOKEN, "").trim();
    if (junk) return `Unrecognized: ${junk}`;
    if (!parseSequenceTokens(alg).length) return "Enter an algorithm";
    if (!sq1CaseAlignment(alg)) return "A slice is blocked - check the turns";
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

// 3x3: the inverse of the alg from solved, after turning the chosen colour to the top.
export function cubeCaseSetup(alg: string, topColor: TopColor): string {
  return `${topColor === "yellow" ? "z2 " : ""}${invertAlg(alg)}`;
}

// Sq1 algs often end with both layers a step off from where they started (sheets drop the final
// adjustment), so the case can't always be set up by undoing the alg from exact solved. Returns the
// smallest engine-convention (u, d) pre-rotation of solved that keeps every slice of the undo legal.
export function sq1CaseAlignment(alg: string): [number, number] | null {
  const undo = toEngineConvention(invertSequence(alg));
  let best: [number, number] | null = null;
  for (let u = -5; u <= 6; u++) {
    for (let d = -5; d <= 6; d++) {
      if (best && Math.abs(u) + Math.abs(d) >= Math.abs(best[0]) + Math.abs(best[1])) continue;
      if (Square.createSolved().rotate(u, d).executeSequence(undo)) best = [u, d];
    }
  }
  return best;
}

// Square-1 case for the thumbnail, in engine convention.
export function sq1CaseSetup(alg: string): string {
  const [u, d] = sq1CaseAlignment(alg) ?? [0, 0];
  return `${u},${d} ${toEngineConvention(invertSequence(alg))}`;
}

// Split into individually playable moves (so playback can pause between them).
export function algMoves(puzzle: Puzzle, alg: string): string[] {
  return puzzle === "3x3" ? parseAlg(alg) : parseSequenceTokens(alg);
}

// One line per entry: "name: alg" or just "alg". Blank lines are skipped.
export function parseBulk(text: string): { line: string; name: string; alg: string }[] {
  return text
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const colon = line.indexOf(":");
      return colon === -1
        ? { line, name: "", alg: line.trim() }
        : { line, name: line.slice(0, colon).trim(), alg: line.slice(colon + 1).trim() };
    });
}
