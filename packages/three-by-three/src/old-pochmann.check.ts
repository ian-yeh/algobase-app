// Self-check: executes the traced memo with real OP setups + swaps on random scrambles and asserts the cube ends solved.
// Run: npx esbuild packages/three-by-three/src/old-pochmann.check.ts --bundle --platform=node | node
import { Cube } from "./cube";
import { OP_ALGS, opAlgForLetter, traceOldPochmann } from "./old-pochmann";
import { generateScramble } from "./scramble";

let parityCount = 0;
for (let i = 0; i < 2000; i++) {
  const scramble = generateScramble();
  const cube = new Cube().apply(scramble);
  const memo = traceOldPochmann(cube);
  memo.edges.forEach((l) => cube.apply(opAlgForLetter(l, "edge")!));
  if (memo.parity) cube.apply(OP_ALGS.Ra);
  memo.corners.forEach((l) => cube.apply(opAlgForLetter(l, "corner")!));
  if (!cube.isSolved()) throw new Error(`Not solved: ${scramble} ${JSON.stringify(memo)}`);
  if (memo.parity !== (memo.corners.length % 2 === 1)) throw new Error(`Parity mismatch: ${scramble}`);
  if (memo.parity) parityCount++;
}
if (!new Cube().apply("R U R' U' ".repeat(6)).isSolved()) throw new Error("sexy move order");
console.log(`ok - 2000 scrambles solved by traced memo (${parityCount} with parity)`);
