// Raw data only - no puzzle-specific types here. Consumers (e.g.
// @algobase/square-one) own the shapes/interfaces for their own domain and
// type this JSON on the way in.
import presetsJson from "./presets.json";
import cspCasesJson from "./csp-cases.json";

export const PRESET_ALGORITHMS_JSON = presetsJson;
export const CSP_CASES_JSON = cspCasesJson;
