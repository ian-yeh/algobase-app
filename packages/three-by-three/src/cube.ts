// 3x3 pure state engine (no Three.js). Vocabulary: a "facelet" is one of the 54 sticker locations, indexed in URFDLB face order, 9 per face, row by row as the face is viewed from outside (U with B at the top, D with F at the top, the side faces with U at the top) - the Kociemba/cubing.js layout. A "sticker" is identified by the facelet it sits on when solved, so Cube.facelets[i] = the sticker currently at location i. Coordinates: +x = R, +y = U, +z = F, one unit per cubie, center cubie at the origin.

export type Vec3 = [number, number, number];
export type Axis = 0 | 1 | 2;

export const FACES = ["U", "R", "F", "D", "L", "B"] as const;
export type Face = (typeof FACES)[number];

export interface Facelet {
  pos: Vec3;
  normal: Vec3;
}

const FACE_LAYOUT: Record<Face, (r: number, c: number) => Facelet> = {
  U: (r, c) => ({ pos: [c - 1, 1, r - 1], normal: [0, 1, 0] }),
  R: (r, c) => ({ pos: [1, 1 - r, 1 - c], normal: [1, 0, 0] }),
  F: (r, c) => ({ pos: [c - 1, 1 - r, 1], normal: [0, 0, 1] }),
  D: (r, c) => ({ pos: [c - 1, -1, 1 - r], normal: [0, -1, 0] }),
  L: (r, c) => ({ pos: [-1, 1 - r, c - 1], normal: [-1, 0, 0] }),
  B: (r, c) => ({ pos: [1 - c, 1 - r, -1], normal: [0, 0, -1] }),
};

export const FACELETS: Facelet[] = FACES.flatMap((face) =>
  Array.from({ length: 9 }, (_, i) => FACE_LAYOUT[face](Math.floor(i / 3), i % 3))
);

const faceletKey = (f: Facelet) => `${f.pos}|${f.normal}`;
const FACELET_INDEX = new Map(FACELETS.map((f, i) => [faceletKey(f), i]));

export interface MoveDef {
  axis: Axis;
  // which slices (coordinate along `axis`) turn
  layers: number[];
  // right-hand quarter turns about +axis; a clockwise face turn is -1 about its own outward normal
  quarterTurns: number;
}

const BASE_MOVES: Record<string, [Axis, number[], number]> = {
  U: [1, [1], -1], D: [1, [-1], 1], R: [0, [1], -1], L: [0, [-1], 1], F: [2, [1], -1], B: [2, [-1], 1],
  M: [0, [0], 1], E: [1, [0], 1], S: [2, [0], -1],
  u: [1, [1, 0], -1], d: [1, [-1, 0], 1], r: [0, [1, 0], -1], l: [0, [-1, 0], 1], f: [2, [1, 0], -1], b: [2, [-1, 0], 1],
  x: [0, [-1, 0, 1], -1], y: [1, [-1, 0, 1], -1], z: [2, [-1, 0, 1], -1],
};

// Accepts WCA-style tokens: R, R', R2, R2', Rw (= r), M, x, ...
export function parseMove(token: string): MoveDef {
  const match = token.match(/^(?:([URFDLB])w|([URFDLBMESxyzurfdlb]))(2?)('?)$/);
  if (!match) throw new Error(`Invalid move: ${token}`);
  const [axis, layers, quarterTurns] = BASE_MOVES[match[1] ? match[1].toLowerCase() : match[2]];
  const amount = (match[3] ? 2 : 1) * (match[4] ? -1 : 1);
  return { axis, layers, quarterTurns: quarterTurns * amount };
}

export function parseAlg(alg: string): string[] {
  return alg.replace(/[()[\]]/g, " ").split(/\s+/).filter(Boolean);
}

export function invertAlg(alg: string): string {
  return parseAlg(alg)
    .reverse()
    .map((token) => (token.endsWith("'") ? token.slice(0, -1) : `${token}'`))
    .join(" ");
}

// One right-hand quarter turn about +axis, applied `quarterTurns` times.
export function rotateVec(v: Vec3, axis: Axis, quarterTurns: number): Vec3 {
  let [x, y, z] = v;
  for (let i = 0; i < ((quarterTurns % 4) + 4) % 4; i++) {
    if (axis === 0) [y, z] = [-z, y];
    else if (axis === 1) [x, z] = [z, -x];
    else [x, y] = [-y, x];
  }
  return [x, y, z];
}

const permutationCache = new Map<string, number[]>();

// perm[destination] = source facelet index
function movePermutation(token: string): number[] {
  const cached = permutationCache.get(token);
  if (cached) return cached;
  const { axis, layers, quarterTurns } = parseMove(token);
  const perm = FACELETS.map((_, i) => i);
  FACELETS.forEach((f, i) => {
    if (!layers.includes(f.pos[axis])) return;
    const dest = FACELET_INDEX.get(
      faceletKey({ pos: rotateVec(f.pos, axis, quarterTurns), normal: rotateVec(f.normal, axis, quarterTurns) })
    )!;
    perm[dest] = i;
  });
  permutationCache.set(token, perm);
  return perm;
}

export class Cube {
  public facelets: number[];

  constructor(facelets: number[] = FACELETS.map((_, i) => i)) {
    this.facelets = [...facelets];
  }

  public static createSolved(): Cube {
    return new Cube();
  }

  public clone(): Cube {
    return new Cube(this.facelets);
  }

  public move(token: string): this {
    const perm = movePermutation(token);
    const before = this.facelets;
    this.facelets = perm.map((src) => before[src]);
    return this;
  }

  public apply(alg: string): this {
    parseAlg(alg).forEach((token) => this.move(token));
    return this;
  }

  public isSolved(): boolean {
    return this.facelets.every((sticker, i) => sticker === i);
  }

  // Face color (by solved face letter) of the sticker at facelet `index`.
  public colorAt(index: number): Face {
    return FACES[Math.floor(this.facelets[index] / 9)];
  }
}
