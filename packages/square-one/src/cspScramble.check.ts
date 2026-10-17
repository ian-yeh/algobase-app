// Self-check for cubeshape training scrambles.
// Run: npx esbuild packages/square-one/src/cspScramble.check.ts --bundle --platform=node | node
import { CSP_CASES, Square, flipCspShape, generateCspScramble, shapeFromLayerKinds, toEngineConvention } from "./index";

function assert(cond: unknown, msg = "check failed"): asserts cond {
  if (!cond) throw new Error(msg);
}

function apply(scramble: string): Square {
  const sq = Square.createSolved();
  assert(sq.executeSequence(toEngineConvention(scramble)), `blocked: ${scramble}`);
  return sq;
}

// Every case's scramble really lands on that case's shape pair (either way up) - catches a mirrored read of chiral shapes.
for (const c of CSP_CASES) {
  for (let i = 0; i < 3; i++) {
    const s = generateCspScramble({ caseIds: [c.id] });
    assert(s.caseId === c.id);
    const sq = apply(s.scramble);
    const pair = [shapeFromLayerKinds(sq.getTopLayerKinds(), "top"), shapeFromLayerKinds(sq.getBottomLayerKinds(), "bottom")];
    const want = [c.topShape, c.bottomShape];
    assert(
      (pair[0] === want[0] && pair[1] === want[1]) || (pair[0] === want[1] && pair[1] === want[0]),
      `${c.id}: got ${pair.join(" / ")}`,
    );
    assert(generateCspScramble({ shape: flipCspShape(s.shape) }).caseId === c.id, `${c.id}: flip changed case`);
  }
}

// Same `shape` + `parity` gives the same piece-permutation parity in the engine (so the same CSP alg), opposite gives the other.
const SOLVED_ORDER = [...Square.createSolved().getTopLayer(), ...Square.createSolved().getBottomLayer()].map((c) => c.piece.id);
function enginePermParity(sq: Square): number {
  const ids = [...sq.getTopLayer(), ...sq.getBottomLayer()].filter((c) => c.pieceHalf === 0).map((c) => SOLVED_ORDER.indexOf(c.piece.id));
  let p = 0;
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) if (ids[i] > ids[j]) p ^= 1;
  return p;
}
for (const c of CSP_CASES) {
  const a = generateCspScramble({ caseIds: [c.id] });
  const same = generateCspScramble({ shape: a.shape, parity: a.parity });
  const opposite = generateCspScramble({ shape: a.shape, parity: 1 - a.parity });
  const [pa, ps, po] = [a, same, opposite].map((s) => enginePermParity(apply(s.scramble)));
  assert(pa === ps, `${c.id}: same parity differs`);
  assert(pa !== po, `${c.id}: opposite parity matches`);
}

console.log("ok");
