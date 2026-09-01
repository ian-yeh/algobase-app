import { CSP_CASES_JSON } from "@algobase/data";
import type { PresetAlgorithm } from "./presets";
import type { Shape } from "./shapes";

// A CSP case is one shape pair (top layer shape / bottom layer shape). The
// same visible shape pair can be reached in an odd- or even-parity
// permutation - they look identical but need different algorithms, so each
// case carries both, and the trainable skill is telling them apart by
// counting during inspection, not by the shape's appearance.
export interface CspCase {
  id: string;
  topShape: Shape;
  bottomShape: Shape;
  evenAlg?: PresetAlgorithm;
  oddAlg?: PresetAlgorithm;
}

// Sourced from cubingapp.com/algorithms/SQ1-CSP (Brandon Lin).
export const CSP_CASES: CspCase[] = CSP_CASES_JSON as CspCase[];
