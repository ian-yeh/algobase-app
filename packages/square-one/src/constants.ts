import * as THREE from "three";

// RADIUS is the half-width of the cube (axis to the middle of a flat face); the three
// layer heights add up to 2 * RADIUS so the solved puzzle is a cube.
export const RADIUS = 1.05;
export const HEIGHT_TOP = 0.7;
export const HEIGHT_MID = 0.7;
export const HEIGHT_BOTTOM = 0.7;

// Piece boundaries sit at multiples of 30deg, outline passes through R_BOUNDARY there;
// a corner's apex (a vertical edge of the cube) bulges to R_APEX at its 60deg midpoint.
export const R_BOUNDARY = RADIUS / Math.cos(THREE.MathUtils.degToRad(15));
export const R_APEX = RADIUS * Math.SQRT2;

// Real Square-1 scheme: white/yellow are the layer (top/bottom) colors, the other
// four wrap the vertical faces.
export const WHITE = "#f2c230";
export const GREEN = "#2f8f46";
export const YELLOW = "#f2f2ec";
export const BLUE = "#2456c9";
export const RED = "#e2791e";
export const ORANGE = "#d1352b";
export const DARK = "#161616";
export const OUTLINE = "#101010";

// Neutral sticker color for a monochrome (no color bias) render - see
// Square1Renderer's `monochrome` option.
export const GREY = "#c7c7c7";

// the four vertical faces of the cube, in order around the perimeter; each is
// 90deg wide and is covered by one edge plus half of the corner either side
export const FACE_COLORS = [GREEN, ORANGE, BLUE, RED];

// which face (index into FACE_COLORS) each of the 12 slots' outward-facing
// sticker belongs to; corners straddle two faces (one per half), edges sit
// fully inside one
export const SLOT_FACE_INDEX = [3, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3];

export function faceColorForSlot(slotIndex: number): string {
  return FACE_COLORS[SLOT_FACE_INDEX[((slotIndex % 12) + 12) % 12]];
}

// material slots every wedge mesh is built with: the two lids, the interior
// plastic, then the outward-facing sticker colors
export const MAT_CAP_LOW = 0;
export const MAT_CAP_HIGH = 1;
export const MAT_INNER = 2;
export const MAT_SIDE_A = 3;
export const MAT_SIDE_B = 4;
