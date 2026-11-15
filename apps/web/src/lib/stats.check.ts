// Self-check for trimmed-mean averages and time formatting.
// Run: npx esbuild apps/web/src/lib/stats.check.ts --bundle --platform=node | node
import { calculateAO5, calculateAO12, calculateAverageSeries, effectiveSeconds, formatSecondsTime, formatSolve, formatTime, penaltyOf } from "./stats";

function assert(cond: unknown, msg = "check failed"): asserts cond {
  if (!cond) throw new Error(msg);
}

const near = (a: number | null, b: number) => a !== null && Math.abs(a - b) < 1e-9;

// Ao5 drops the single best and worst, averages the middle three. Index 0 is newest.
assert(near(calculateAO5([10, 1, 12, 11, 99]), 11), "ao5 trims best and worst");
assert(near(calculateAO5([10, 11, 12, 13, 14, 1000]), 12), "ao5 uses only the 5 newest");
assert(calculateAO5([10, 11, 12, 13]) === null, "ao5 needs 5 solves");
assert(calculateAO12(Array(11).fill(10)) === null, "ao12 needs 12 solves");
assert(near(calculateAO12([1, ...Array(10).fill(10), 50]), 10), "ao12 trims one each end");

// DNFs are passed as Infinity: one is trimmed as the worst, two make the average DNF.
assert(near(calculateAO5([10, 11, 12, 13, Infinity]), 12), "one DNF counts as worst");
assert(calculateAO5([10, 11, 12, Infinity, Infinity]) === Infinity, "two DNFs -> DNF average");
assert(formatSecondsTime(Infinity) === "DNF");

const series = calculateAverageSeries([10, 11, 12, 13, 14, 15], 5);
assert(series.length === 6 && near(series[0], 12) && near(series[1], 13) && series[2] === null);

assert(formatTime(9_870) === "9.87");
assert(formatTime(65_430) === "1:05.43");
assert(formatTime(3_725_000) === "01:02:05.00");
assert(formatSecondsTime(0) === "--" && formatSecondsTime(null) === "--");
console.log("stats ok");

// Penalties: time is stored without the +2.
assert(effectiveSeconds({ time: 10, plus2: true }) === 12 && effectiveSeconds({ time: 10, dnf: true }) === Infinity);
assert(formatSolve({ time: 10.5, plus2: true }) === "12.50+" && formatSolve({ time: 10, dnf: true }) === "DNF" && formatSolve({ time: 9.87 }) === "9.87");
assert(penaltyOf({ time: 1, dnf: true, plus2: true }) === "dnf" && penaltyOf({ time: 1 }) === "none");
console.log("penalties ok");
