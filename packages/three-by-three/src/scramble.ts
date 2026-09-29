const FACES_BY_AXIS = [["R", "L"], ["U", "D"], ["F", "B"]];
const SUFFIXES = ["", "'", "2"];

const pick = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

// ponytail: random-move, not random-state - fine for trace practice, port cstimer's min2phase if a WCA-grade scramble is needed.
// No face turned twice in a row and no axis revisited without a different axis in between (no "R L R").
export function generateScramble(length = 25): string {
  const moves: string[] = [];
  let usedOnAxis: string[] = [];
  let lastAxis = -1;
  while (moves.length < length) {
    const axis = Math.floor(Math.random() * 3);
    const face = pick(FACES_BY_AXIS[axis]);
    if (axis === lastAxis && usedOnAxis.includes(face)) continue;
    if (axis !== lastAxis) usedOnAxis = [];
    lastAxis = axis;
    usedOnAxis.push(face);
    moves.push(face + pick(SUFFIXES));
  }
  return moves.join(" ");
}
