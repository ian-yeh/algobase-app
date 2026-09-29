import { Cube, FACELETS, FACES, invertAlg, type Face } from "./cube";

// Speffz lettering: faces in U L F R B D order, 4 letters each, clockwise from the top-left corner / top edge of the face as laid out in cube.ts. This is the canonical order the trace engine (speffzFacelet, OP_ALGS, the setups in old-pochmann.check.ts) is built against - don't reorder it without re-deriving those setups.
export const SPEFFZ = "ABCDEFGHIJKLMNOPQRSTUVWX";
const SPEFFZ_FACES: Face[] = ["U", "L", "F", "R", "B", "D"];
// Cosmetic-only face order for the on-cube letter labels: A-D/U-X stay on U/D, the middle three
// groups run F, R, B, L instead of L, F, R, B. This is the lettering the user sees and types, so the
// public API (opAlgForLetter, traceOldPochmann) speaks it and translates to/from the engine's order.
const DISPLAY_FACES: Face[] = ["U", "F", "R", "B", "L", "D"];
const CORNER_CELLS = [0, 2, 8, 6];
const EDGE_CELLS = [1, 5, 7, 3];

export type PieceType = "edge" | "corner";

function faceletFor(letter: string, type: PieceType, faces: Face[]): number {
  const k = SPEFFZ.indexOf(letter);
  const cells = type === "edge" ? EDGE_CELLS : CORNER_CELLS;
  return FACES.indexOf(faces[Math.floor(k / 4)]) * 9 + cells[k % 4];
}

// Same sticker spot, relettered from one face order to the other - a whole-face remap, so it's
// identical for edges and corners.
function remapLetter(letter: string, from: Face[], to: Face[]): string {
  const k = SPEFFZ.indexOf(letter);
  return SPEFFZ[to.indexOf(from[Math.floor(k / 4)]) * 4 + (k % 4)];
}
const toEngine = (letter: string) => remapLetter(letter, DISPLAY_FACES, SPEFFZ_FACES);
const toDisplay = (letter: string) => remapLetter(letter, SPEFFZ_FACES, DISPLAY_FACES);

// Facelet index (cube.ts) of a Speffz letter's sticker, in the engine's (standard Speffz) order.
export function speffzFacelet(letter: string, type: PieceType): number {
  return faceletFor(letter, type, SPEFFZ_FACES);
}

// The letter (edge or corner) painted at each facelet location - a fixed physical spot on the
// cube's shell, not tied to whichever sticker currently sits there. null for the 6 centers.
export const FACELET_LETTERS: (string | null)[] = FACELETS.map(() => null);
for (const letter of SPEFFZ) {
  FACELET_LETTERS[faceletFor(letter, "edge", DISPLAY_FACES)] = letter;
  FACELET_LETTERS[faceletFor(letter, "corner", DISPLAY_FACES)] = letter;
}

export const EDGE_BUFFER = "B"; // UR
export const CORNER_BUFFER = "A"; // UBL

// OP swaps, all checked against the engine: each exchanges the buffer with the swap target plus a fixed side effect that cancels out over an even number of swaps.
export const OP_ALGS = {
  // UR <-> UL (target D), side effect UBR <-> UFR
  T: "R U R' U' R' F R2 U' R' U' R U R' F'",
  // UR <-> UB (target A), same side effect
  Ja: "x R2 F R F' R U2 r' U r U2 x'",
  // UR <-> UF (target C), same side effect
  Jb: "R U R' F' R U R' U' R' F R2 U' R' U'",
  // UBL <-> RDF (target P), side effect UB <-> UL
  Y: "R U' R' U' R U R' F' R U R' U' R' F R",
  // parity: UB <-> UL and UBR <-> UFR, undoes both side effects after an odd number of swaps
  Ra: "R U R' F' R U2 R' U2 R' F R U R U2 R' U'",
};

// Standard Old Pochmann setup table: for each target letter, the setup moves that bring its piece
// to the buffer's fixed swap slot, and which OP_ALGS entry performs the swap. A letter missing from
// its table is one of the buffer piece's own location letters - it's never a swap target.
const EDGE_SETUPS: Record<string, string> = {
  A: "[Ja]", C: "[Jb]", D: "[T]", E: "L d' L [T]", F: "d' L [T]", G: "D l' [Jb]", H: "d L' [T]", I: "l' [Ja]",
  J: "d2 L [T]", K: "l' [Jb]", L: "L' [T]", N: "d L [T]", O: "D l [Ja]", P: "d' L' [T]", Q: "l [Jb]", R: "L [T]",
  S: "l [Ja]", T: "d2 L' [T]", U: "l2 [Ja]", V: "D l2 [Jb]", W: "l2 [Jb]", X: "L2 [T]",
};
const CORNER_SETUPS: Record<string, string> = {
  B: "R D' [Y]", C: "F [Y]", D: "F R' [Y]", F: "F2 [Y]", G: "D2 R [Y]", H: "D2 [Y]", I: "F' D [Y]", J: "R2 D' [Y]",
  K: "R F [Y]", L: "D [Y]", M: "R' [Y]", N: "R2 [Y]", O: "R [Y]", P: "[Y]", Q: "R' F [Y]", S: "D' R [Y]",
  T: "D' [Y]", U: "F' [Y]", V: "R' D' [Y]", W: "R2 F [Y]", X: "D F' [Y]",
};
const OP_SETUPS: Record<PieceType, Record<string, string>> = { edge: EDGE_SETUPS, corner: CORNER_SETUPS };

// Full move sequence (setup, swap, undo-setup) that executes one memo letter's swap on a live cube -
// the "practice" counterpart to speffzFacelet. Takes a display letter (FACELET_LETTERS). null for a
// buffer's own letters, which have no swap.
export function opAlgForLetter(letter: string, type: PieceType): string | null {
  const entry = OP_SETUPS[type][toEngine(letter)];
  if (!entry) return null;
  const [, setup, algName] = entry.match(/^(.*?)\s*\[(\w+)\]$/)!;
  return `${setup} ${OP_ALGS[algName as keyof typeof OP_ALGS]} ${invertAlg(setup)}`.trim();
}

// Every piece as its Speffz letters, starting from its U/D sticker (F/B for E-slice edges) and going round in a fixed handedness, so aligning two pieces sticker-for-sticker is just an index offset.
function buildPieces(type: PieceType): string[][] {
  const byCubie = new Map<string, string[]>();
  for (const letter of SPEFFZ) {
    const key = `${FACELETS[speffzFacelet(letter, type)].pos}`;
    byCubie.set(key, [...(byCubie.get(key) ?? []), letter]);
  }
  // U/D normal first, then F/B, then L/R
  const rank = (letter: string) => {
    const n = FACELETS[speffzFacelet(letter, type)].normal;
    return n[1] !== 0 ? 0 : n[2] !== 0 ? 1 : 2;
  };
  return [...byCubie.values()]
    .map((piece) => {
      const sorted = piece.sort((a, b) => rank(a) - rank(b));
      // (y, z, x) normal order flips handedness wherever the corner's x*y*z is negative
      const [x, y, z] = FACELETS[speffzFacelet(sorted[0], type)].pos;
      if (sorted.length === 3 && x * y * z < 0) [sorted[1], sorted[2]] = [sorted[2], sorted[1]];
      return sorted;
    })
    .sort((a, b) => a[0].localeCompare(b[0]));
}

const PIECES: Record<PieceType, string[][]> = { edge: buildPieces("edge"), corner: buildPieces("corner") };

function traceType(cube: Cube, type: PieceType, buffer: string): string[] {
  const pieces = PIECES[type];
  const pieceOf = (letter: string) => pieces.find((p) => p.includes(letter))!;
  const letterOfFacelet = new Map([...SPEFFZ].map((l) => [speffzFacelet(l, type), l]));
  // at[location letter] = home letter of the sticker sitting there
  const at = new Map([...SPEFFZ].map((l) => [l, letterOfFacelet.get(cube.facelets[speffzFacelet(l, type)])!]));

  const bufferPiece = pieceOf(buffer);
  const start = bufferPiece.indexOf(buffer);
  const swap = (target: string) => {
    const targetPiece = pieceOf(target);
    const offset = targetPiece.indexOf(target);
    for (let k = 0; k < bufferPiece.length; k++) {
      const b = bufferPiece[(start + k) % bufferPiece.length];
      const t = targetPiece[(offset + k) % targetPiece.length];
      const held = at.get(b)!;
      at.set(b, at.get(t)!);
      at.set(t, held);
    }
  };

  const memo: string[] = [];
  for (;;) {
    const home = at.get(buffer)!;
    if (!bufferPiece.includes(home)) {
      memo.push(home);
      swap(home);
      continue;
    }
    // cycle break: buffer holds its own piece, so shoot it to the first unsolved piece
    const unsolved = pieces.find((p) => p !== bufferPiece && p.some((l) => at.get(l) !== l));
    if (!unsolved) return memo;
    memo.push(unsolved[0]);
    swap(unsolved[0]);
  }
}

// Letters are display letters (FACELET_LETTERS), matching what opAlgForLetter takes.
export interface OldPochmannMemo {
  edges: string[];
  corners: string[];
  // odd number of targets - Ra perm between edges and corners
  parity: boolean;
}

export function traceOldPochmann(cube: Cube): OldPochmannMemo {
  const edges = traceType(cube, "edge", EDGE_BUFFER).map(toDisplay);
  const corners = traceType(cube, "corner", CORNER_BUFFER).map(toDisplay);
  return { edges, corners, parity: edges.length % 2 === 1 };
}
