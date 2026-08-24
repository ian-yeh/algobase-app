// Square-1 pure state engine (no Three.js).
//
// Vocabulary:
// - A "layer" is the top or bottom face of the cube. It has 12 angular positions,
//   30° apart, called LayerCells. An edge piece fills exactly 1 cell. A corner piece
//   fills 2 adjacent cells - cell.pieceHalf marks which half of the corner sits there
//   (0 = first half, 1 = second half; always 0 for an edge).
// - The "equator" is the middle layer: two trapezoid halves, identified as 'M1' and
//   'M2'. Which one currently sits in the front vs. back position is what a slice
//   move swaps.
// - A slice ("/") is only legal when no corner straddles cell boundary 0 (cells 11|0)
//   or 6 (cells 5|6) in either layer - that corner would have to pass through itself.

import {
  cloneLayerCells,
  buildSolvedLayer,
  buildLayerFromPieceKinds,
  isSliceClear,
  isLayerCellArray,
  parseSequenceTokens,
  rotateArrayRight,
} from "./square1.utils";

export type PieceKind = 'corner' | 'edge';
export type EquatorHalfId = 'M1' | 'M2';

export interface Piece {
  id: string;
  type: PieceKind;
}

// One of the 12 angular positions (30° each) in a top or bottom layer.
export interface LayerCell {
  piece: Piece;
  pieceHalf: 0 | 1; // which half of a corner occupies this cell; always 0 for an edge
}

export class Square {
  private topLayer: LayerCell[];
  private bottomLayer: LayerCell[];
  private equatorHalves: EquatorHalfId[]; // [half in front position, half in back position]

  // Default is the solved position.
  constructor(
    top?: PieceKind[] | LayerCell[],
    bottom?: PieceKind[] | LayerCell[],
    equatorHalves?: EquatorHalfId[]
  ) {
    if (top && top.length === 12) {
      this.topLayer = isLayerCellArray(top) ? cloneLayerCells(top) : buildLayerFromPieceKinds(top, 'top');
    } else {
      this.topLayer = buildSolvedLayer('top');
    }

    if (bottom && bottom.length === 12) {
      this.bottomLayer = isLayerCellArray(bottom) ? cloneLayerCells(bottom) : buildLayerFromPieceKinds(bottom, 'bot');
    } else {
      this.bottomLayer = buildSolvedLayer('bot');
    }

    this.equatorHalves = equatorHalves && equatorHalves.length === 2 ? [...equatorHalves] : ['M1', 'M2'];
  }

  public static createSolved(): Square {
    return new Square();
  }

  // e.g. fromPieceKindArrays(['corner','corner','edge',...], ['corner','corner','edge',...])
  public static fromPieceKindArrays(
    topKinds: PieceKind[],
    bottomKinds: PieceKind[],
    equatorHalves: EquatorHalfId[] = ['M1', 'M2']
  ): Square {
    return new Square(topKinds, bottomKinds, equatorHalves);
  }

  public getTopLayerKinds(): PieceKind[] {
    return this.topLayer.map((c) => c.piece.type);
  }

  public getBottomLayerKinds(): PieceKind[] {
    return this.bottomLayer.map((c) => c.piece.type);
  }

  public getEquatorHalves(): EquatorHalfId[] {
    return [...this.equatorHalves];
  }

  public getTopLayer(): ReadonlyArray<LayerCell> {
    return this.topLayer;
  }

  public getBottomLayer(): ReadonlyArray<LayerCell> {
    return this.bottomLayer;
  }

  public canSliceTop(): boolean {
    return isSliceClear(this.topLayer);
  }

  public canSliceBottom(): boolean {
    return isSliceClear(this.bottomLayer);
  }

  public canSlice(): boolean {
    return this.canSliceTop() && this.canSliceBottom();
  }

  // steps is a count of 30° turns: positive = clockwise, negative = counter-clockwise.
  public rotateTop(steps: number): this {
    if (steps % 12 !== 0) {
      this.topLayer = rotateArrayRight(this.topLayer, steps);
    }
    return this;
  }

  public rotateBottom(steps: number): this {
    if (steps % 12 !== 0) {
      this.bottomLayer = rotateArrayRight(this.bottomLayer, steps);
    }
    return this;
  }

  public rotate(topSteps: number, bottomSteps: number): this {
    this.rotateTop(topSteps);
    this.rotateBottom(bottomSteps);
    return this;
  }

  // Swaps the right halves (cells 0..5) of top/bottom, reversed by the 180° flip, and
  // toggles which equator half is in front.
  public slice(): boolean {
    if (!this.canSlice()) {
      return false;
    }

    const topRightHalf = this.topLayer.slice(0, 6);
    const bottomRightHalf = this.bottomLayer.slice(0, 6);

    for (let i = 0; i < 6; i++) {
      this.topLayer[i] = bottomRightHalf[5 - i];
      this.bottomLayer[i] = topRightHalf[5 - i];
    }

    this.equatorHalves = [this.equatorHalves[1], this.equatorHalves[0]];

    return true;
  }

  // Executes one move string, e.g. "(1, -2)", "/", "(1, 0)/".
  public executeMove(moveStr: string): boolean {
    const trimmed = moveStr.trim();
    if (!trimmed) return true;

    if (trimmed === '/') {
      return this.slice();
    }

    if (trimmed.endsWith('/')) {
      const rotPart = trimmed.slice(0, -1).trim();
      if (rotPart && !this.executeMove(rotPart)) return false;
      return this.slice();
    }

    const match = trimmed.match(/^\(?\s*(-?\d+)\s*,\s*(-?\d+)\s*\)?$/);
    if (match) {
      this.rotate(parseInt(match[1], 10), parseInt(match[2], 10));
      return true;
    }

    return false;
  }

  // Executes a sequence of moves, e.g. "(1, 0) / (-3, 3) / (0, -1) /".
  public executeSequence(sequence: string): boolean {
    for (const token of parseSequenceTokens(sequence)) {
      if (!this.executeMove(token)) return false;
    }
    return true;
  }

  public isSolved(): boolean {
    if (this.equatorHalves[0] !== 'M1' || this.equatorHalves[1] !== 'M2') {
      return false;
    }

    const solvedTop = buildSolvedLayer('top');
    const solvedBottom = buildSolvedLayer('bot');

    for (let i = 0; i < 12; i++) {
      if (this.topLayer[i].piece.id !== solvedTop[i].piece.id) return false;
      if (this.bottomLayer[i].piece.id !== solvedBottom[i].piece.id) return false;
    }

    return true;
  }

  public clone(): Square {
    const copy = Object.create(Square.prototype) as Square;
    copy.topLayer = cloneLayerCells(this.topLayer);
    copy.bottomLayer = cloneLayerCells(this.bottomLayer);
    copy.equatorHalves = [...this.equatorHalves];
    return copy;
  }

  public toString(): string {
    const topStr = this.getTopLayerKinds().join(',');
    const bottomStr = this.getBottomLayerKinds().join(',');
    const equatorStr = this.equatorHalves.join('-');
    const sliceable = this.canSlice() ? 'Slice: OK' : 'Slice: BLOCKED';
    return `Square-1 {\n  Top:     [${topStr}]\n  Bottom:  [${bottomStr}]\n  Equator: [${equatorStr}]\n  Status:  ${sliceable}\n}`;
  }
}

export { parseSequenceTokens, invertSequence } from "./square1.utils";
