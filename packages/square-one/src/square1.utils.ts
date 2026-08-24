import type { Piece, PieceKind, LayerCell } from "./square1";

export function isLayerCellArray(arr: (PieceKind | LayerCell)[]): arr is LayerCell[] {
  return arr.length > 0 && typeof arr[0] === 'object' && arr[0] !== null && 'piece' in arr[0];
}

export function cloneLayerCells(cells: LayerCell[]): LayerCell[] {
  return cells.map((c) => ({
    piece: { ...c.piece },
    pieceHalf: c.pieceHalf,
  }));
}

// Builds a solved 12-cell layer: [corner, corner, edge, corner, corner, edge, ...].
export function buildSolvedLayer(prefix: 'top' | 'bot'): LayerCell[] {
  const cells: LayerCell[] = [];
  let cornerIdx = 1;
  let edgeIdx = 1;

  for (let i = 0; i < 4; i++) {
    const cornerPiece: Piece = { id: `${prefix}-C${cornerIdx++}`, type: 'corner' };
    cells.push({ piece: cornerPiece, pieceHalf: 0 });
    cells.push({ piece: cornerPiece, pieceHalf: 1 });

    const edgePiece: Piece = { id: `${prefix}-E${edgeIdx++}`, type: 'edge' };
    cells.push({ piece: edgePiece, pieceHalf: 0 });
  }

  return cells;
}

// Groups an array like ['corner','corner','edge',...] into piece/cell objects, including wrap-around at 11-0.
export function buildLayerFromPieceKinds(kinds: PieceKind[], prefix: string): LayerCell[] {
  if (kinds.length !== 12) {
    throw new Error(`Layer array must be of length 12, got ${kinds.length}`);
  }

  const cells: LayerCell[] = new Array(12);
  let pieceCounter = 1;
  const firstEdgeIdx = kinds.findIndex((k) => k === 'edge');

  if (firstEdgeIdx === -1) {
    for (let i = 0; i < 12; i += 2) {
      const piece: Piece = { id: `${prefix}-C${pieceCounter++}`, type: 'corner' };
      cells[i] = { piece, pieceHalf: 0 };
      cells[i + 1] = { piece, pieceHalf: 1 };
    }
    return cells;
  }

  let step = 0;
  const start = (firstEdgeIdx + 1) % 12;

  while (step < 12) {
    const idx = (start + step) % 12;
    const kind = kinds[idx];

    if (kind === 'edge') {
      const piece: Piece = { id: `${prefix}-E${pieceCounter++}`, type: 'edge' };
      cells[idx] = { piece, pieceHalf: 0 };
      step += 1;
    } else if (kind === 'corner') {
      const nextIdx = (idx + 1) % 12;
      if (kinds[nextIdx] !== 'corner') {
        throw new Error(`Invalid layer: corner at index ${idx} must be 2 adjacent 'corner' cells.`);
      }
      const piece: Piece = { id: `${prefix}-C${pieceCounter++}`, type: 'corner' };
      cells[idx] = { piece, pieceHalf: 0 };
      cells[nextIdx] = { piece, pieceHalf: 1 };
      step += 2;
    }
  }

  return cells;
}

// A slice is blocked if the same corner piece straddles cell boundary 0 (cells 11|0) or 6 (cells 5|6) - that corner would have to pass through itself.
export function isSliceClear(cells: LayerCell[]): boolean {
  return cells[11].piece.id !== cells[0].piece.id && cells[5].piece.id !== cells[6].piece.id;
}

export function rotateArrayRight<T>(arr: T[], shift: number): T[] {
  const n = arr.length;
  const k = ((shift % n) + n) % n;
  if (k === 0) return arr;
  return arr.map((_, i) => arr[(i - k + n) % n]);
}

// External Square-1 notation ("physical" D - positive D turns the bottom layer clockwise as viewed from below, the way you'd grip it) is the mirror of this engine's D (Square.rotate/rotateBottom treat D the same sign as U). Every physical sequence (button presses, presets, CSP algs, WCA scrambles) gets converted through this one function before it reaches Square or the renderer.
export function physicalToEngineD(d: number): number {
  return -d;
}

export function toEngineConvention(sequence: string): string {
  return parseSequenceTokens(sequence)
    .map((token) => {
      if (token === '/') return token;
      const [u, d] = token.split(',').map(Number);
      return `${u},${physicalToEngineD(d)}`;
    })
    .join(' ');
}

// Splits "(1, 0) / (-3, 3) / (0, -1)" into ["(1, 0)", "/", "(-3, 3)", "/", "(0, -1)"].
export function parseSequenceTokens(seq: string): string[] {
  const tokens: string[] = [];
  const regex = /(\([^)]+\)\/?|\/|-?\d+\s*,\s*-?\d+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(seq)) !== null) {
    const raw = match[0].trim();
    if (!raw) continue;

    if (raw === '/') {
      tokens.push('/');
    } else if (raw.endsWith('/')) {
      const movePart = raw.slice(0, -1).trim();
      if (movePart) tokens.push(movePart);
      tokens.push('/');
    } else {
      tokens.push(raw);
    }
  }

  return tokens;
}

// Inverts a move sequence: reverse the token order, negate each rotation's (u, d), and leave slices ('/') as-is since a slice is its own inverse - e.g. inverse of "3,-3 / 2,2" is "-2,-2 / -3,3", inverse of "/ -6,0 /" is "/ 6,0 /". A CSP case's setup (the scramble that reaches it from solved) is the inverse of its solving algorithm.
export function invertSequence(seq: string): string {
  const tokens = parseSequenceTokens(seq);

  const inverted = tokens
    .slice()
    .reverse()
    .map((token) => {
      if (token === '/') return '/';

      const match = token.match(/^\(?\s*(-?\d+)\s*,\s*(-?\d+)\s*\)?$/);
      if (!match) {
        throw new Error(`Invalid move token: ${token}`);
      }

      const u = -parseInt(match[1], 10);
      const d = -parseInt(match[2], 10);
      return `${u},${d}`;
    });

  return inverted.join(' ');
}
