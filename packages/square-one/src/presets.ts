import { PRESET_ALGORITHMS_JSON } from "@algobase/data";
import type { Square } from "./square1";

export interface PresetAlgorithm {
  label: string;
  sequence: string;
}

// Sourced from Andy Klise's Square-1 algorithm sheet (kungfoomanchu.com) and
// Sarah's Cubing Site EP guide (sarah.cubing.net/square-1/ep, cases 01 and 22).
export const PRESET_ALGORITHMS: PresetAlgorithm[] = PRESET_ALGORITHMS_JSON;

// Random U/D turn, repeated until it lands on a slice-clear position, then sliced. 12 times.
export function generateScrambleSequence(startState: Square, slices: number = 12): string {
  const state = startState.clone();
  const tokens: string[] = [];

  for (let i = 0; i < slices; i++) {
    let u = 0;
    let d = 0;
    let found = false;

    for (let attempt = 0; attempt < 100 && !found; attempt++) {
      u = Math.floor(Math.random() * 12) - 5; // -5..6, all distinct 30° steps
      d = Math.floor(Math.random() * 12) - 5;
      if (u === 0 && d === 0) continue;
      found = state.clone().rotate(u, -d).canSlice();
    }

    state.rotate(u, -d);
    tokens.push(`(${u}, ${d})`);
    state.slice();
    tokens.push("/");
  }

  return tokens.join(" ");
}
