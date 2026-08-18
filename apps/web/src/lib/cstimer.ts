export interface ImportedSolve {
    cubeType: string;
    time: number; // seconds
    scramble: string;
    dnf: boolean;
}

export interface CsTimerSession {
    key: string; // "session1"
    name: string; // user-given name in csTimer, falls back to the key
    cubeType: string;
    solves: ImportedSolve[];
}

// csTimer scramble types that aren't NxN cubes
const PUZZLE_NAMES: Record<string, string> = {
    sq: 'Square-1',
    py: 'Pyraminx',
    sk: 'Skewb',
    cl: 'Clock',
    mg: 'Megaminx',
};

const cubeTypeFor = (scrType?: string) => {
    if (!scrType) return '3x3';
    const nxn = scrType.match(/^(\d)\1/);
    if (nxn) return `${nxn[1]}x${nxn[1]}`;
    return PUZZLE_NAMES[scrType.slice(0, 2)] ?? '3x3';
};

// csTimer export: { session1: [[[penalty, ms], scramble, comment, unixDate], ...], properties: {...} }
// penalty is 0 (none), 2000 (+2, already excluded from ms) or -1 (DNF).
export const parseCsTimer = (text: string): CsTimerSession[] => {
    const data = JSON.parse(text);
    const sessionData = data?.properties?.sessionData
        ? JSON.parse(data.properties.sessionData)
        : {};

    const sessions: CsTimerSession[] = [];
    for (const [key, session] of Object.entries(data)) {
        const index = key.match(/^session(\d+)$/)?.[1];
        if (!index || !Array.isArray(session)) continue;

        const meta = sessionData[index];
        const cubeType = cubeTypeFor(meta?.opt?.scrType);
        sessions.push({
            key,
            name: meta?.name || key,
            cubeType,
            solves: session.map((entry) => {
                const [penalty, ms] = entry[0];
                return {
                    cubeType,
                    time: (ms + (penalty > 0 ? penalty : 0)) / 1000,
                    scramble: String(entry[1] ?? '').trim(),
                    dnf: penalty === -1,
                };
            }),
        });
    }
    return sessions.filter((s) => s.solves.length > 0);
};
