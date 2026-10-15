// Self-check for alg validation, case setup and bulk parsing.
// Run: npx esbuild apps/web/src/lib/algList.check.ts --bundle --platform=node | node
import { Cube } from "@algobase/three-by-three";
import { CSP_CASES, Square, invertSequence, toEngineConvention } from "@algobase/square-one";
import { cubeCaseSetup, parseBulk, sq1CaseAlignment, sq1CaseSetup, validateAlg } from "./algList";

function assert(cond: unknown, msg = "check failed"): asserts cond {
  if (!cond) throw new Error(msg);
}

const T_PERM = "R U R' U' R' F R2 U' R' U' R U R' F'";
assert(validateAlg("3x3", T_PERM) === null);
assert(validateAlg("3x3", "(R U R') [x y2] Rw M2' u") === null);
assert(validateAlg("3x3", "R Q") !== null);
assert(validateAlg("3x3", "  ") !== null);
assert(validateAlg("3x3", "[R, U]") !== null);

// Case setup then the alg returns to solved (with or without the yellow-top rotation).
for (const top of ["white", "yellow"] as const) {
  const cube = Cube.createSolved().apply(cubeCaseSetup(T_PERM, top)).apply(T_PERM);
  assert(top === "white" ? cube.isSolved() : !cube.isSolved());
  if (top === "yellow") assert(cube.apply("z2").isSolved());
}

// Bad stock data: undoing these blocks a slice from every layer offset of solved, so they can't end in cube shape.
const BLOCKED_STOCK = ["left-5-1-perpendicular-edges", "3-2-1-parallel-edges", "3-3-parallel-edges"];
for (const c of CSP_CASES.filter((c) => !BLOCKED_STOCK.includes(c.id))) {
  for (const a of [c.evenAlg, c.oddAlg]) if (a) assert(validateAlg("sq1", a.sequence) === null, `${c.id}: ${a.sequence}`);
}
// Ends with both layers a step off - only settable-up from an offset solved.
const CORNER_SLASH = "(3,-4) / (4,-2) / (2,-4) / (1,0) / (3,3) / (4,-3) / (4,-2) / (2,-4) / (0,5) / (-3,-3) /";
assert(validateAlg("sq1", CORNER_SLASH) === null);
const [u, d] = sq1CaseAlignment(CORNER_SLASH)!;
const sq = Square.createSolved();
assert(sq.executeSequence(sq1CaseSetup(CORNER_SLASH)) && sq.executeSequence(toEngineConvention(invertSequence(invertSequence(CORNER_SLASH)))));
sq.rotate(-u, -d);
assert(sq.isSolved(), "case + alg + final adjustment should be solved");
assert(validateAlg("sq1", "(1,0)/ foo") !== null);
assert(validateAlg("sq1", "/ (1,0) / (1,0) /") !== null); // blocked from every cube-shape start

assert(
  JSON.stringify(parseBulk("T: R U\n\nU2 R\n").map(({ name, alg }) => [name, alg])) ===
    JSON.stringify([["T", "R U"], ["", "U2 R"]])
);
console.log("algList ok");
