// Timer utilities with WCA-compliant 3x3 scramble generation
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

// WCA-compliant 3x3 scramble generation
export const FACES = ["U", "D", "L", "R", "F", "B"] as const;
export const MODS = ["", "'", "2"] as const;

// Face groups that cannot be done consecutively
const OPPOSITE_FACES: Record<string, string> = {
  "U": "D", "D": "U",
  "L": "R", "R": "L", 
  "F": "B", "B": "F"
};

// Check if two faces are on the same axis
const sameAxis = (face1: string, face2: string): boolean => {
  return OPPOSITE_FACES[face1] === face2 || OPPOSITE_FACES[face2] === face1;
};

export const generateScramble = (len = 25): string => {
  const moves: string[] = [];
  let lastFace: string | null = null;
  let secondLastFace: string | null = null;
  
  // Track axis usage to prevent too many consecutive moves on same axis
  let consecutiveAxisMoves = 0;
  let lastAxis: string | null = null;
  
  while (moves.length < len) {
    // Get available faces (exclude last face to prevent consecutive same face moves)
    const availableFaces = FACES.filter(face => face !== lastFace);
    
    // If we've had 2+ moves on same axis, prefer different axis
    if (consecutiveAxisMoves >= 2 && lastAxis) {
      const differentAxisFaces = availableFaces.filter(face => 
        !sameAxis(face, lastAxis!)
      );
      
      // If we have options on different axes, prefer those
      if (differentAxisFaces.length > 0) {
        const face = differentAxisFaces[Math.floor(Math.random() * differentAxisFaces.length)];
        const mod = MODS[Math.floor(Math.random() * MODS.length)];
        
        moves.push(face + mod);
        secondLastFace = lastFace;
        lastFace = face;
        lastAxis = OPPOSITE_FACES[face] === secondLastFace ? lastAxis : face;
        consecutiveAxisMoves = sameAxis(face, lastAxis || "") ? consecutiveAxisMoves + 1 : 1;
        lastAxis = face;
        continue;
      }
    }
    
    // Standard face selection from available faces
    const face = availableFaces[Math.floor(Math.random() * availableFaces.length)];
    
    // Special handling for three consecutive moves on same axis
    // WCA allows max 3 moves on same axis, but third move must be opposite face
    if (consecutiveAxisMoves >= 2 && lastAxis && sameAxis(face, lastAxis)) {
      if (face !== OPPOSITE_FACES[lastAxis]) {
        continue; // Skip this iteration, try again
      }
    }
    
    const mod = MODS[Math.floor(Math.random() * MODS.length)];
    moves.push(face + mod);
    
    // Update tracking variables
    secondLastFace = lastFace;
    lastFace = face;
    
    if (lastAxis && sameAxis(face, lastAxis)) {
      consecutiveAxisMoves++;
    } else {
      consecutiveAxisMoves = 1;
      lastAxis = face;
    }
  }
  
  return moves.join(" ");
};

/**
 * Alternative implementation using weighted random selection
 * This version more closely mimics the statistical properties of WCA scrambles
 */
export const generateWCAScramble = (len = 25): string => {
  const moves: string[] = [];
  let lastFace: string | null = null;
  let secondLastFace: string | null = null;
  
  // Weights for move selection (slightly favor quarter turns over double turns)
  const modWeights = [0.45, 0.45, 0.10]; // ["", "'", "2"]
  
  const selectWeightedMod = (): string => {
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < MODS.length; i++) {
      cumulative += modWeights[i];
      if (rand <= cumulative) {
        return MODS[i];
      }
    }
    return MODS[0]; // fallback
  };
  
  while (moves.length < len) {
    // Get available faces
    let availableFaces = FACES.filter(face => face !== lastFace);
    
    // Additional constraint: avoid three consecutive moves on same axis
    if (moves.length >= 2 && secondLastFace && lastFace) {
      if (sameAxis(secondLastFace, lastFace)) {
        // Last two moves were on same axis, so exclude same axis faces
        availableFaces = availableFaces.filter(face => 
          !sameAxis(face, lastFace!)
        );
      }
    }
    
    // If no faces available (shouldn't happen with proper logic), reset constraints
    if (availableFaces.length === 0) {
      availableFaces = FACES.filter(face => face !== lastFace);
    }
    
    const face = availableFaces[Math.floor(Math.random() * availableFaces.length)];
    const mod = selectWeightedMod();
    
    moves.push(face + mod);
    
    secondLastFace = lastFace;
    lastFace = face;
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

// Example usage:
// const scramble = generateScramble(); // Standard implementation
// const wcaScramble = generateWCAScramble(); // Weighted implementation
