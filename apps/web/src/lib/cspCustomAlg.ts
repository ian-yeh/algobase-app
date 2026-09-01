import { getCspAlg, type CspCase, type CspParity, type PresetAlgorithm } from "@algobase/square-one";

// Some people trace Square-1 CSP parity the opposite way round - what they call
// "even" is what this app's algorithm data calls "odd", and vice versa. The flip
// is its own inverse, so one function handles both display and un-display.
export function flipParity(parity: CspParity): CspParity {
  return parity === "even" ? "odd" : "even";
}

export interface CspCustomization {
  evenAlg?: string;
  oddAlg?: string;
  notes?: string;
  swapped?: boolean;
}

// A user's own algorithm text takes priority over the stock cubingapp.com one.
export function getEffectiveCspAlg(
  cspCase: CspCase,
  parity: CspParity,
  customization?: CspCustomization | null
): PresetAlgorithm {
  const override = parity === "even" ? customization?.evenAlg : customization?.oddAlg;
  if (override) return { label: "Custom", sequence: override };
  return getCspAlg(cspCase, parity);
}
