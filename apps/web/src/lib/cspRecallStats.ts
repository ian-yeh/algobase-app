// Local (browser-only) right/wrong tally per CSP case, used to bias the
// algorithm-test draw toward cases the user gets wrong more often.
const STORAGE_KEY = "algobase-csp-recall-stats";

interface CaseStats {
  right: number;
  wrong: number;
}

export type CspStatsMap = Record<string, CaseStats>;

export function loadCspStats(): CspStatsMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CspStatsMap) : {};
  } catch {
    return {};
  }
}

export function recordCspResult(stats: CspStatsMap, caseId: string, correct: boolean): CspStatsMap {
  const entry = stats[caseId] ?? { right: 0, wrong: 0 };
  const next: CspStatsMap = {
    ...stats,
    [caseId]: correct ? { ...entry, right: entry.right + 1 } : { ...entry, wrong: entry.wrong + 1 },
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // best-effort persistence - ignore quota/availability errors
  }
  return next;
}

// Draw weight for a case: more misses than hits means it shows up more often.
// Capped so one bad case doesn't flood every draw.
export function cspCaseWeight(stats: CspStatsMap, caseId: string): number {
  const entry = stats[caseId];
  if (!entry) return 1;
  return 1 + Math.min(Math.max(entry.wrong - entry.right, 0), 3);
}
