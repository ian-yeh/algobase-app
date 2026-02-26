/**
 * Generates a standard WCA 3x3x3 scramble.
 * 20 random moves, ensuring no redundant moves are adjacent.
 */
export function generateScramble(): string {
    const moves = ['U', 'D', 'L', 'R', 'F', 'B'];
    const modifiers = ['', "'", '2'];
    const scramble: string[] = [];
    let lastMove = '';
    let secondLastMove = '';

    while (scramble.length < 20) {
        const move = moves[Math.floor(Math.random() * moves.length)];

        // Avoid same move twice in a row (e.g., R R)
        // Avoid redundant moves on opposite faces (e.g., R L R) - Simplified: just avoid R L R, not R L R'
        if (move === lastMove) continue;
        if (move === secondLastMove && isOpposite(move, lastMove)) continue;

        const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
        scramble.push(move + modifier);

        secondLastMove = lastMove;
        lastMove = move;
    }

    return scramble.join(' ');
}

function isOpposite(m1: string, m2: string): boolean {
    const opposites: Record<string, string> = {
        'U': 'D', 'D': 'U',
        'L': 'R', 'R': 'L',
        'F': 'B', 'B': 'F'
    };
    return opposites[m1] === m2;
}
