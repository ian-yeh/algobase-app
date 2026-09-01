import { PRESET_ALGORITHMS_JSON } from "@algobase/data";

export interface PresetAlgorithm {
  label: string;
  sequence: string;
}

// Sourced from Andy Klise's Square-1 algorithm sheet (kungfoomanchu.com) and
// Sarah's Cubing Site EP guide (sarah.cubing.net/square-1/ep, cases 01 and 22).
export const PRESET_ALGORITHMS: PresetAlgorithm[] = PRESET_ALGORITHMS_JSON;
