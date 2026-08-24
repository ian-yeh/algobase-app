// WCA-regulated Square-1 scramble generation, ported from cstimer's Square-1 solver (cs0x7f/cstimer, src/js/scramble/scramble_sq1_new.js): samples a uniformly random *reachable* state, finds a near-optimal solution with two-phase IDA* search, and inverts it (that's the scramble), rerolling anything shorter than the WCA minimum of 11 moves (Regulation 12c4) - matching the official TNoodle scrambler. The bitwise tricks below rely on 32-bit two's-complement semantics (JS shares this with Java), so this is a close port, not a reimplementation from first principles.

const WCA_MIN_SCRAMBLE_DISTANCE = 11;

// --- small perm-index utilities (n = 8 case only, per mathlib.js) ---------

const FACT = [1, 1, 2, 6, 24, 120, 720, 5040];

function setPerm8(arr: number[], idx: number): void {
  let vall = 0x76543210;
  let valh = 0xfedcba98;
  for (let i = 0; i < 7; i++) {
    const p = FACT[7 - i];
    const v = Math.floor(idx / p);
    idx = idx % p;
    const vv = v << 2;
    if (vv >= 32) {
      const vv2 = vv - 32;
      arr[i] = (valh >> vv2) & 0xf;
      const m = (1 << vv2) - 1;
      valh = (valh & m) + ((valh >> 4) & ~m);
    } else {
      arr[i] = (vall >> vv) & 0xf;
      const m = (1 << vv) - 1;
      vall = (vall & m) + ((vall >>> 4) & ~m) + (valh << 28);
      valh = valh >> 4;
    }
  }
  arr[7] = vall & 0xf;
}

function getPerm8(arr: number[]): number {
  let idx = 0;
  let vall = 0x76543210;
  let valh = 0xfedcba98;
  for (let i = 0; i < 7; i++) {
    const v = arr[i] << 2;
    idx *= 8 - i;
    if (v >= 32) {
      idx += (valh >> (v - 32)) & 0xf;
      valh -= 0x11111110 << (v - 32);
    } else {
      idx += (vall >> v) & 0xf;
      valh -= 0x11111111;
      vall -= 0x11111110 << v;
    }
  }
  return idx;
}

// Cyclic rotation matching mathlib's circle(): each listed index takes the value the previous listed index held; the first takes the last's.
function circle(arr: number[], ...indices: number[]): void {
  const last = indices.length - 1;
  const temp = arr[indices[last]];
  for (let i = last; i > 0; i--) {
    arr[indices[i]] = arr[indices[i - 1]];
  }
  arr[indices[0]] = temp;
}

function bitCount(x: number): number {
  x -= (x >> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  x += x >> 8;
  x += x >> 16;
  return x & 0x3f;
}

function binarySearch(sortedArray: number[], key: number): number {
  let low = 0;
  let high = sortedArray.length - 1;
  while (low <= high) {
    const mid = low + ((high - low) >> 1);
    const midVal = sortedArray[mid];
    if (midVal < key) low = mid + 1;
    else if (midVal > key) high = mid - 1;
    else return mid;
  }
  return -low - 1;
}

function randInt(n: number): number {
  return Math.floor(Math.random() * n);
}

// --- SqCubie: the 24-piece bit-packed Square-1 state - ul/ur/dl/dr each pack 6 pieces as 4-bit ids (24 bits); ml is the middle slice orientation (0/1); piece ids 0-15: even = edge, odd = corner-half ---

class SqCubie {
  ul = 0x011233;
  ur = 0x455677;
  dl = 0x998bba;
  dr = 0xddcffe;
  ml = 0;

  pieceAt(idx: number): number {
    let ret: number;
    if (idx < 6) ret = this.ul >> ((5 - idx) << 2);
    else if (idx < 12) ret = this.ur >> ((11 - idx) << 2);
    else if (idx < 18) ret = this.dl >> ((17 - idx) << 2);
    else ret = this.dr >> ((23 - idx) << 2);
    return ret & 0xf;
  }

  setPiece(idx: number, value: number): void {
    if (idx < 6) {
      this.ul &= ~(0xf << ((5 - idx) << 2));
      this.ul |= value << ((5 - idx) << 2);
    } else if (idx < 12) {
      this.ur &= ~(0xf << ((11 - idx) << 2));
      this.ur |= value << ((11 - idx) << 2);
    } else if (idx < 18) {
      this.dl &= ~(0xf << ((17 - idx) << 2));
      this.dl |= value << ((17 - idx) << 2);
    } else {
      this.dr &= ~(0xf << ((23 - idx) << 2));
      this.dr |= value << ((23 - idx) << 2);
    }
  }

  copy(c: SqCubie): void {
    this.ul = c.ul;
    this.ur = c.ur;
    this.dl = c.dl;
    this.dr = c.dr;
    this.ml = c.ml;
  }

  // move: 0 = twist (slice), [1,11] = top turn, [-1,-11] = bottom turn.
  doMove(move: number): void {
    let temp: number;
    move <<= 2;
    if (move > 24) {
      move = 48 - move;
      temp = this.ul;
      this.ul = ((this.ul >> move) | (this.ur << (24 - move))) & 0xffffff;
      this.ur = ((this.ur >> move) | (temp << (24 - move))) & 0xffffff;
    } else if (move > 0) {
      temp = this.ul;
      this.ul = ((this.ul << move) | (this.ur >> (24 - move))) & 0xffffff;
      this.ur = ((this.ur << move) | (temp >> (24 - move))) & 0xffffff;
    } else if (move === 0) {
      temp = this.ur;
      this.ur = this.dl;
      this.dl = temp;
      this.ml = 1 - this.ml;
    } else if (move >= -24) {
      move = -move;
      temp = this.dl;
      this.dl = ((this.dl << move) | (this.dr >> (24 - move))) & 0xffffff;
      this.dr = ((this.dr << move) | (temp >> (24 - move))) & 0xffffff;
    } else {
      move = 48 + move;
      temp = this.dl;
      this.dl = ((this.dl >> move) | (this.dr << (24 - move))) & 0xffffff;
      this.dr = ((this.dr >> move) | (temp << (24 - move))) & 0xffffff;
    }
  }
}

interface SquareCoord {
  edgeperm: number;
  cornperm: number;
  topEdgeFirst: boolean;
  botEdgeFirst: boolean;
  ml: number;
}

function getParity(cube: SqCubie): number {
  const arr: number[] = [cube.pieceAt(0)];
  let cnt = 0;
  for (let i = 1; i < 24; i++) {
    if (cube.pieceAt(i) !== arr[cnt]) {
      arr[++cnt] = cube.pieceAt(i);
    }
  }
  let p = 0;
  for (let a = 0; a < 16; a++) {
    for (let b = a + 1; b < 16; b++) {
      if (arr[a] > arr[b]) p ^= 1;
    }
  }
  return p;
}

function getSquareCoord(cube: SqCubie): SquareCoord {
  const prm: number[] = [];
  for (let a = 0; a < 8; a++) {
    prm[a] = cube.pieceAt(a * 3 + 1) >> 1;
  }
  const cornperm = getPerm8(prm);

  const topEdgeFirst = cube.pieceAt(0) === cube.pieceAt(1);
  let a = topEdgeFirst ? 2 : 0;
  let b = 0;
  for (; b < 4; a += 3, b++) prm[b] = cube.pieceAt(a) >> 1;

  const botEdgeFirst = cube.pieceAt(12) === cube.pieceAt(13);
  a = botEdgeFirst ? 14 : 12;
  for (; b < 8; a += 3, b++) prm[b] = cube.pieceAt(a) >> 1;

  const edgeperm = getPerm8(prm);
  return { edgeperm, cornperm, topEdgeFirst, botEdgeFirst, ml: cube.ml };
}

// --- Shape tables: which of the 24 slots on each layer are corner-halves --

interface Tables {
  shapeIdx: number[];
  shapePrun: Int8Array;
  shapeTopMove: Int32Array;
  shapeBottomMove: Int32Array;
  shapeTwistMove: Int32Array;
  squarePrun: Int8Array;
  squareTopMove: Int32Array;
  squareBottomMove: Int32Array;
  squareTwistMove: Int32Array;
}

let tables: Tables | null = null;

const HALFLAYER = [0, 3, 6, 12, 15, 24, 27, 30, 48, 51, 54, 60, 63];

interface ShapeState {
  top: number;
  bottom: number;
  parity: number;
}

function shapeGetIdx(shapeIdx: number[], s: ShapeState): number {
  return (binarySearch(shapeIdx, (s.top << 12) | s.bottom) << 1) | s.parity;
}

function shapeSetIdx(shapeIdx: number[], s: ShapeState, idx: number): void {
  s.parity = idx & 1;
  s.top = shapeIdx[idx >> 1];
  s.bottom = s.top & 0xfff;
  s.top >>= 12;
}

function shapeTopMove(s: ShapeState): number {
  let move = 0;
  let moveParity = 0;
  do {
    if ((s.top & 0x800) === 0) {
      move += 1;
      s.top = s.top << 1;
    } else {
      move += 2;
      s.top = (s.top << 2) ^ 0x3003;
    }
    moveParity = 1 - moveParity;
  } while ((bitCount(s.top & 0x3f) & 1) !== 0);
  if ((bitCount(s.top) & 2) === 0) s.parity ^= moveParity;
  return move;
}

function shapeBottomMove(s: ShapeState): number {
  let move = 0;
  let moveParity = 0;
  do {
    if ((s.bottom & 0x800) === 0) {
      move += 1;
      s.bottom = s.bottom << 1;
    } else {
      move += 2;
      s.bottom = (s.bottom << 2) ^ 0x3003;
    }
    moveParity = 1 - moveParity;
  } while ((bitCount(s.bottom & 0x3f) & 1) !== 0);
  if ((bitCount(s.bottom) & 2) === 0) s.parity ^= moveParity;
  return move;
}

function buildShapeTables() {
  const shapeIdx: number[] = [];
  for (let i = 0; i < 13 * 13 * 13 * 13; i++) {
    const dr = HALFLAYER[i % 13];
    const dl = HALFLAYER[Math.floor(i / 13) % 13];
    const ur = HALFLAYER[Math.floor(i / 13 / 13) % 13];
    const ul = HALFLAYER[Math.floor(i / 13 / 13 / 13)];
    const value = (ul << 18) | (ur << 12) | (dl << 6) | dr;
    if (bitCount(value) === 16) shapeIdx.push(value);
  }

  const n = shapeIdx.length * 2; // 7356
  const shapeTopMoveArr = new Int32Array(n);
  const shapeBottomMoveArr = new Int32Array(n);
  const shapeTwistMoveArr = new Int32Array(n);
  const s: ShapeState = { top: 0, bottom: 0, parity: 0 };

  for (let i = 0; i < n; i++) {
    shapeSetIdx(shapeIdx, s, i);
    shapeTopMoveArr[i] = shapeTopMove(s) | (shapeGetIdx(shapeIdx, s) << 4);

    shapeSetIdx(shapeIdx, s, i);
    shapeBottomMoveArr[i] = shapeBottomMove(s) | (shapeGetIdx(shapeIdx, s) << 4);

    shapeSetIdx(shapeIdx, s, i);
    const temp = s.top & 0x3f;
    const p1 = bitCount(temp);
    const p3 = bitCount(s.bottom & 0xfc0);
    s.parity ^= 1 & ((p1 & p3) >> 1);
    s.top = (s.top & 0xfc0) | ((s.bottom >> 6) & 0x3f);
    s.bottom = (s.bottom & 0x3f) | (temp << 6);
    shapeTwistMoveArr[i] = shapeGetIdx(shapeIdx, s);
  }

  const shapePrun = new Int8Array(n).fill(-1);
  const getShape2Idx = (shp: number): number =>
    (binarySearch(shapeIdx, shp & 0xffffff) << 1) | (shp >> 24);

  // The 4 cube-shape (solved-shape) states, at every twist/parity.
  shapePrun[getShape2Idx(0x0db66db)] = 0;
  shapePrun[getShape2Idx(0x1db6db6)] = 0;
  shapePrun[getShape2Idx(0x16db6db)] = 0;
  shapePrun[getShape2Idx(0x06dbdb6)] = 0;

  let done = 4;
  let done0 = 0;
  let depth = -1;
  while (done !== done0) {
    done0 = done;
    depth++;
    for (let i = 0; i < n; i++) {
      if (shapePrun[i] !== depth) continue;

      let m = 0;
      let idx = i;
      do {
        idx = shapeTopMoveArr[idx];
        m += idx & 0xf;
        idx >>= 4;
        if (shapePrun[idx] === -1) {
          done++;
          shapePrun[idx] = depth + 1;
        }
      } while (m !== 12);

      m = 0;
      idx = i;
      do {
        idx = shapeBottomMoveArr[idx];
        m += idx & 0xf;
        idx >>= 4;
        if (shapePrun[idx] === -1) {
          done++;
          shapePrun[idx] = depth + 1;
        }
      } while (m !== 12);

      idx = shapeTwistMoveArr[i];
      if (shapePrun[idx] === -1) {
        done++;
        shapePrun[idx] = depth + 1;
      }
    }
  }

  return { shapeIdx, shapePrun, shapeTopMoveArr, shapeBottomMoveArr, shapeTwistMoveArr };
}

function buildSquareTables() {
  const squareTwistMove = new Int32Array(40320);
  const squareTopMove = new Int32Array(40320);
  const squareBottomMove = new Int32Array(40320);
  const pos: number[] = [];

  for (let i = 0; i < 40320; i++) {
    setPerm8(pos, i);
    circle(pos, 2, 4);
    circle(pos, 3, 5);
    squareTwistMove[i] = getPerm8(pos);

    setPerm8(pos, i);
    circle(pos, 0, 3, 2, 1);
    squareTopMove[i] = getPerm8(pos);

    setPerm8(pos, i);
    circle(pos, 4, 7, 6, 5);
    squareBottomMove[i] = getPerm8(pos);
  }

  const squarePrun = new Int8Array(40320 * 2).fill(-1);
  squarePrun[0] = 0;
  let depth = 0;
  let done = 1;
  while (done < 40320 * 2) {
    const inv = depth >= 11;
    const find = inv ? -1 : depth;
    const check = inv ? depth : -1;
    depth++;
    outer: for (let i = 0; i < 40320 * 2; i++) {
      if (squarePrun[i] !== find) continue;
      const perm = i >> 1;
      const ml = i & 1;

      let idx = (squareTwistMove[perm] << 1) | (1 - ml);
      if (squarePrun[idx] === check) {
        done++;
        squarePrun[inv ? i : idx] = depth;
        if (inv) continue outer;
      }

      let p = perm;
      for (let m = 0; m < 4; m++) {
        p = squareTopMove[p];
        idx = (p << 1) | ml;
        if (squarePrun[idx] === check) {
          done++;
          squarePrun[inv ? i : idx] = depth;
          if (inv) continue outer;
        }
      }

      p = perm;
      for (let m = 0; m < 4; m++) {
        p = squareBottomMove[p];
        idx = (p << 1) | ml;
        if (squarePrun[idx] === check) {
          done++;
          squarePrun[inv ? i : idx] = depth;
          if (inv) continue outer;
        }
      }
    }
  }

  return { squarePrun, squareTopMove, squareBottomMove, squareTwistMove };
}

function ensureTables(): Tables {
  if (tables) return tables;
  const shape = buildShapeTables();
  const square = buildSquareTables();
  tables = {
    shapeIdx: shape.shapeIdx,
    shapePrun: shape.shapePrun,
    shapeTopMove: shape.shapeTopMoveArr,
    shapeBottomMove: shape.shapeBottomMoveArr,
    shapeTwistMove: shape.shapeTwistMoveArr,
    squarePrun: square.squarePrun,
    squareTopMove: square.squareTopMove,
    squareBottomMove: square.squareBottomMove,
    squareTwistMove: square.squareTwistMove,
  };
  return tables;
}

function fullCubeGetShapeIdx(t: Tables, cube: SqCubie): number {
  const reduce = (v: number): number => {
    v &= 0x111111;
    v |= v >> 3;
    v |= v >> 6;
    return (v & 0xf) | ((v >> 12) & 0x30);
  };
  const urx = reduce(cube.ur);
  const ulx = reduce(cube.ul);
  const drx = reduce(cube.dr);
  const dlx = reduce(cube.dl);
  const shp = (getParity(cube) << 24) | (ulx << 18) | (urx << 12) | (dlx << 6) | drx;
  return (binarySearch(t.shapeIdx, shp & 0xffffff) << 1) | (shp >> 24);
}

function randomCube(t: Tables, shapeIndice?: number): SqCubie {
  const indice = shapeIndice === undefined ? randInt(t.shapeIdx.length) : shapeIndice;
  const f = new SqCubie();
  const shape = t.shapeIdx[indice];
  let corner = (0x01234567 << 1) | 0x11111111;
  let edge = 0x01234567 << 1;
  let nCorner = 8;
  let nEdge = 8;

  for (let i = 0; i < 24; i++) {
    if (((shape >> i) & 1) === 0) {
      // edge
      const rnd = randInt(nEdge) << 2;
      f.setPiece(23 - i, (edge >> rnd) & 0xf);
      const m = (1 << rnd) - 1;
      edge = (edge & m) + ((edge >> 4) & ~m);
      nEdge--;
    } else {
      // corner
      const rnd = randInt(nCorner) << 2;
      f.setPiece(23 - i, (corner >> rnd) & 0xf);
      f.setPiece(22 - i, (corner >> rnd) & 0xf);
      const m = (1 << rnd) - 1;
      corner = (corner & m) + ((corner >> 4) & ~m);
      nCorner--;
      i++;
    }
  }
  f.ml = randInt(2);
  return f;
}

// --- two-phase IDA* search: solve a random state, we invert it for the scramble --

class Search {
  private t = ensureTables();
  private move: number[] = [];
  private c!: SqCubie;
  private d = new SqCubie();
  private length1 = 0;
  private maxlen2 = 0;
  private movelen1 = 0;

  solution(c: SqCubie): string {
    this.c = c;
    const t = this.t;
    const shape = fullCubeGetShapeIdx(t, c);
    for (this.length1 = t.shapePrun[shape]; this.length1 < 100; this.length1++) {
      this.maxlen2 = Math.min(32 - this.length1, 17);
      if (this.phase1(shape, t.shapePrun[shape], this.length1, 0, -1)) break;
    }
    return this.moveToInverseString(this.totalLen);
  }

  private totalLen = 0;

  private phase1(shape: number, prunvalue: number, maxl: number, depth: number, lm: number): boolean {
    const t = this.t;
    if (prunvalue === 0 && maxl < 4) {
      this.movelen1 = depth;
      return maxl === 0 && this.initPhase2();
    }

    if (lm !== 0) {
      const shapex = t.shapeTwistMove[shape];
      const prunx = t.shapePrun[shapex];
      if (prunx < maxl) {
        this.move[depth] = 0;
        if (this.phase1(shapex, prunx, maxl - 1, depth + 1, 0)) return true;
      }
    }

    if (lm <= 0) {
      let m = 0;
      let shapex = shape;
      while (true) {
        const step = t.shapeTopMove[shapex];
        m += step & 0xf;
        shapex = step >> 4;
        if (m >= 12) break;
        const prunx = t.shapePrun[shapex];
        if (prunx > maxl) break;
        if (prunx < maxl) {
          this.move[depth] = m;
          if (this.phase1(shapex, prunx, maxl - 1, depth + 1, 1)) return true;
        }
      }
    }

    if (lm <= 1) {
      let m = 0;
      let shapex = shape;
      while (true) {
        const step = t.shapeBottomMove[shapex];
        m += step & 0xf;
        shapex = step >> 4;
        if (m >= 6) break;
        const prunx = t.shapePrun[shapex];
        if (prunx > maxl) break;
        if (prunx < maxl) {
          this.move[depth] = -m;
          if (this.phase1(shapex, prunx, maxl - 1, depth + 1, 2)) return true;
        }
      }
    }
    return false;
  }

  private initPhase2(): boolean {
    const t = this.t;
    this.d.copy(this.c);
    for (let i = 0; i < this.movelen1; i++) this.d.doMove(this.move[i]);
    const sq = getSquareCoord(this.d);

    const prun = Math.max(
      t.squarePrun[(sq.edgeperm << 1) | sq.ml],
      t.squarePrun[(sq.cornperm << 1) | sq.ml],
    );

    for (let i = prun; i < this.maxlen2; i++) {
      if (
        this.phase2(sq.edgeperm, sq.cornperm, sq.topEdgeFirst, sq.botEdgeFirst, sq.ml, i, this.movelen1, 0)
      ) {
        this.totalLen = i + this.movelen1;
        return true;
      }
    }
    return false;
  }

  private phase2(
    edge: number,
    corner: number,
    topEdgeFirst: boolean,
    botEdgeFirst: boolean,
    ml: number,
    maxl: number,
    depth: number,
    lm: number,
  ): boolean {
    const t = this.t;
    if (maxl === 0 && !topEdgeFirst && botEdgeFirst) return true;

    if (lm !== 0 && topEdgeFirst === botEdgeFirst) {
      const edgex = t.squareTwistMove[edge];
      const cornerx = t.squareTwistMove[corner];
      if (t.squarePrun[(edgex << 1) | (1 - ml)] < maxl && t.squarePrun[(cornerx << 1) | (1 - ml)] < maxl) {
        this.move[depth] = 0;
        if (this.phase2(edgex, cornerx, topEdgeFirst, botEdgeFirst, 1 - ml, maxl - 1, depth + 1, 0)) return true;
      }
    }

    if (lm <= 0) {
      let topEdgeFirstx = !topEdgeFirst;
      let edgex = topEdgeFirstx ? t.squareTopMove[edge] : edge;
      let cornerx = topEdgeFirstx ? corner : t.squareTopMove[corner];
      let m = topEdgeFirstx ? 1 : 2;
      let prun1 = t.squarePrun[(edgex << 1) | ml];
      let prun2 = t.squarePrun[(cornerx << 1) | ml];
      while (m < 12 && prun1 <= maxl) {
        if (prun1 < maxl && prun2 < maxl) {
          this.move[depth] = m;
          if (this.phase2(edgex, cornerx, topEdgeFirstx, botEdgeFirst, ml, maxl - 1, depth + 1, 1)) return true;
        }
        topEdgeFirstx = !topEdgeFirstx;
        if (topEdgeFirstx) {
          edgex = t.squareTopMove[edgex];
          prun1 = t.squarePrun[(edgex << 1) | ml];
          m += 1;
        } else {
          cornerx = t.squareTopMove[cornerx];
          prun2 = t.squarePrun[(cornerx << 1) | ml];
          m += 2;
        }
      }
    }

    if (lm <= 1) {
      let botEdgeFirstx = !botEdgeFirst;
      let edgex = botEdgeFirstx ? t.squareBottomMove[edge] : edge;
      let cornerx = botEdgeFirstx ? corner : t.squareBottomMove[corner];
      let m = botEdgeFirstx ? 1 : 2;
      let prun1 = t.squarePrun[(edgex << 1) | ml];
      let prun2 = t.squarePrun[(cornerx << 1) | ml];
      const limit = maxl > 6 ? 6 : 12;
      while (m < limit && prun1 <= maxl) {
        if (prun1 < maxl && prun2 < maxl) {
          this.move[depth] = -m;
          if (this.phase2(edgex, cornerx, topEdgeFirst, botEdgeFirstx, ml, maxl - 1, depth + 1, 2)) return true;
        }
        botEdgeFirstx = !botEdgeFirstx;
        if (botEdgeFirstx) {
          edgex = t.squareBottomMove[edgex];
          prun1 = t.squarePrun[(edgex << 1) | ml];
          m += 1;
        } else {
          cornerx = t.squareBottomMove[cornerx];
          prun2 = t.squarePrun[(cornerx << 1) | ml];
          m += 2;
        }
      }
    }
    return false;
  }

  // Builds the *inverse* of the found solution in this repo's "u,d / u,d /" notation - the bottom value is negated once relative to cstimer's move2string (Square.rotate's positive bottom is the mirror of positive top) and negated again by square1.utils.physicalToEngineD at the Square1Queue boundary every sequence in this app goes through, so the two cancel and bottom is left as-is here (confirmed empirically against the queue's physical-convention simulation).
  private moveToInverseString(len: number): string {
    const tokens: string[] = [];
    let top = 0;
    let bottom = 0;
    for (let i = len - 1; i >= 0; i--) {
      const val = this.move[i];
      if (val > 0) {
        const inv = 12 - val;
        top = inv > 6 ? inv - 12 : inv;
      } else if (val < 0) {
        const inv = 12 + val;
        bottom = inv > 6 ? inv - 12 : inv;
      } else {
        if (top !== 0 || bottom !== 0) tokens.push(`${top},${bottom}`);
        tokens.push('/');
        top = 0;
        bottom = 0;
      }
    }
    if (top !== 0 || bottom !== 0) tokens.push(`${top},${bottom}`);
    return tokens.join(' ');
  }
}

// WCA move-cost: a rotation "(u,d)" and a slice "/" each cost 1 (Regulation 12c4).
function wcaMoveCost(scramble: string): number {
  return scramble.split(/\s+/).filter(Boolean).length;
}

export function generateWCASquareOneScramble(): string {
  const t = ensureTables();
  const search = new Search();
  let scramble: string;
  do {
    scramble = search.solution(randomCube(t));
  } while (wcaMoveCost(scramble) < WCA_MIN_SCRAMBLE_DISTANCE);
  return scramble;
}
