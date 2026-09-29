import type { Face } from "./cube";

// Same palette as @algobase/square-one, in the standard BLD orientation (white top, green front).
export const FACE_COLORS: Record<Face, string> = {
  U: "#f2f2ec",
  F: "#2f8f46",
  R: "#d1352b",
  D: "#f2c230",
  L: "#e2791e",
  B: "#2456c9",
};
export const DARK = "#161616";
// Stickers of the piece type not being trained - dark enough to never be mistaken for white.
export const GREYED_OUT = "#5c5c5c";

// Whole cube spans 3 units; scaled down so it frames like the Square-1 under the same camera.
export const CUBE_SCALE = 0.7;
export const CUBIE_SIZE = 0.98;
export const STICKER_SIZE = 0.84;
export const LABEL_SIZE = 0.45;
