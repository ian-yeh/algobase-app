import { getCspAlg, type CspCase, type CspParity, type PresetAlgorithm } from "@algobase/square-one";

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
