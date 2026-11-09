// Self-check for csTimer export parsing.
// Run: npx esbuild apps/web/src/lib/cstimer.check.ts --bundle --platform=node | node
import { parseCsTimer } from "./cstimer";

function assert(cond: unknown, msg = "check failed"): asserts cond {
  if (!cond) throw new Error(msg);
}

const EXPORT = JSON.stringify({
  session1: [
    [[0, 12345], "R U R' U' ", "", 1700000000],
    [[2000, 10000], "F2 B2", "", 1700000100],
    [[-1, 9000], "L D", "", 1700000200],
  ],
  session2: [[[0, 4210], "(0,-1) / (3,0) /", "", 1700000300]],
  session3: [],
  session4: [[[0, 30000], "U' R2", "", 1700000400]],
  properties: {
    sessionData: JSON.stringify({
      1: { name: "Main 3x3", opt: {} },
      2: { name: 1, opt: { scrType: "sqrs" } },
      4: { opt: { scrType: "444wca" } },
    }),
  },
});

const sessions = parseCsTimer(EXPORT);
assert(sessions.length === 3, "empty sessions and properties are skipped");
const [main, sq1, big] = sessions;

assert(main.key === "session1" && main.name === "Main 3x3" && main.cubeType === "3x3");
assert(main.solves[0].time === 12.345 && !main.solves[0].dnf && main.solves[0].scramble === "R U R' U'");
assert(main.solves[1].time === 12 && !main.solves[1].dnf, "+2 is added to the time");
assert(main.solves[2].time === 9 && main.solves[2].dnf, "DNF keeps raw time and sets dnf");

assert(sq1.cubeType === "Square-1" && sq1.solves[0].cubeType === "Square-1");
assert(big.name === "session4" && big.cubeType === "4x4", "name falls back to key; NxN from scrType");

// No sessionData at all: still parses, defaults to 3x3.
const bare = parseCsTimer(JSON.stringify({ session1: [[[0, 1000], "R", "", 0]] }));
assert(bare.length === 1 && bare[0].cubeType === "3x3" && bare[0].name === "session1");

// Malformed input throws (ImportModal catches it and shows "Could not read that file.").
const throws = (text: string) => {
  try {
    parseCsTimer(text);
    return false;
  } catch {
    return true;
  }
};
assert(throws("not json"));
assert(throws(JSON.stringify({ session1: [[null]] })), "entry without [penalty, ms]");
// Known gap: a non-array entry isn't rejected and parses to a NaN time instead.
assert(Number.isNaN(parseCsTimer(JSON.stringify({ session1: [["bad"]] }))[0].solves[0].time));
assert(parseCsTimer("{}").length === 0 && parseCsTimer("[]").length === 0);
console.log("cstimer ok");
