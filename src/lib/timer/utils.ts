// Timer utilities extracted from timer/page.tsx

export type Penalty = "OK" | "+2" | "DNF";
export type Solve = {
  id: string;
  timeMs: number;
  penalty: Penalty;
  scramble: string;
  date: string;
};

export const formatTime = (ms: number, penalty: Penalty = "OK") => {
  let adj = ms;
  if (penalty === "+2") adj += 2000;
  const negative = adj < 0;
  if (negative) adj = 0;
  const totalCs = Math.floor(adj / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60);
  const pad = (n: number, l = 2) => String(n).padStart(l, "0");
  const base = m > 0 ? `${m}:${pad(s)}` : `${s}`;
  const centi = `.${pad(cs)}`;
  return `${base}${centi}${penalty === "+2" ? " (+2)" : ""}${penalty === "DNF" ? " DNF" : ""}`;
};

export const uid = () => Math.random().toString(36).slice(2, 9);

export const FACES = ["U", "D", "L", "R", "F", "B"] as const;
export const AXIS: Record<(typeof FACES)[number], string> = { U: "UD", D: "UD", L: "LR", R: "LR", F: "FB", B: "FB" };
export const MODS = ["", "'", "2"] as const;

export const generateScramble = (len = 25) => {
  const moves: string[] = [];
  let lastFace: string | null = null;
  let lastAxis: string | null = null;
  while (moves.length < len) {
    const face = FACES[Math.floor(Math.random() * FACES.length)];
    const axis = AXIS[face];
    if (face === lastFace) continue;
    if (axis === lastAxis) {
      if (Math.random() < 0.5) continue;
    }
    const mod = MODS[Math.floor(Math.random() * MODS.length)];
    moves.push(face + mod);
    lastFace = face;
    lastAxis = axis;
  }
  return moves.join(" ");
};

export const computeAverage = (solves: Solve[], n: number) => {
  if (solves.length < n) return { label: `ao${n}`, value: "-" };
  const last = solves.slice(-n);
  const values = last.map((s) => ({
    time: s.timeMs + (s.penalty === "+2" ? 2000 : 0),
    penalty: s.penalty,
  }));
  const dnfCount = values.filter((v) => v.penalty === "DNF").length;
  if (dnfCount >= 2) return { label: `ao${n}`, value: "DNF" };

  const numeric = values.map((v) => (v.penalty === "DNF" ? Number.POSITIVE_INFINITY : v.time));
  const sorted = [...numeric].sort((a, b) => a - b);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const remaining: number[] = [];
  let droppedBest = false;
  let droppedWorst = false;
  for (const v of numeric) {
    if (!droppedBest && v === best) {
      droppedBest = true;
      continue;
    }
    if (!droppedWorst && v === worst) {
      droppedWorst = true;
      continue;
    }
    if (v !== Number.POSITIVE_INFINITY) remaining.push(v);
  }
  if (remaining.length !== n - 2) return { label: `ao${n}`, value: "DNF" };
  const avg = Math.round(remaining.reduce((a, b) => a + b, 0) / remaining.length);
  return { label: `ao${n}`, value: formatTime(avg) };
};

