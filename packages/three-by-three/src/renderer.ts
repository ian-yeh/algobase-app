import * as THREE from "three";
import { Cube, FACELETS, FACES, parseMove, type Vec3 } from "./cube";
import { FACE_COLORS, DARK, GREYED_OUT, CUBE_SCALE, CUBIE_SIZE, STICKER_SIZE, LABEL_SIZE } from "./constants";
import { FACELET_LETTERS, type PieceType } from "./old-pochmann";

export type PieceFocus = PieceType | "all";

// Piece type of a facelet index (or of a sticker id - stickers never change piece type).
const pieceTypeOf = (index: number): PieceType | "center" =>
  index % 9 === 4 ? "center" : (index % 9) % 2 === 0 ? "corner" : "edge";

const letterTextureCache = new Map<string, THREE.CanvasTexture>();

// White-outlined dark letter, readable against any of the six sticker colors.
function letterTexture(letter: string): THREE.CanvasTexture {
  const cached = letterTextureCache.get(letter);
  if (cached) return cached;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.font = "bold 84px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 12;
  ctx.strokeStyle = "#ffffff";
  ctx.strokeText(letter, size / 2, size / 2 + 4);
  ctx.fillStyle = DARK;
  ctx.fillText(letter, size / 2, size / 2 + 4);
  const texture = new THREE.CanvasTexture(canvas);
  letterTextureCache.set(letter, texture);
  return texture;
}

// Pure view: draws a Cube snapshot and plays the visual animation for a move, but never mutates a Cube - that's CubeQueue's job. Cubie bodies are plain dark boxes that never change identity (they all look alike), stickers are one mesh per sticker id placed on whichever facelet the state puts them. Turns re-parent the moving meshes into pivotGroup, animate its rotation, then re-parent back; the queue then calls applyState to snap everything to exact positions.
export class CubeRenderer {
  public rootGroup: THREE.Group;
  public staticGroup: THREE.Group;
  public pivotGroup: THREE.Group;

  private bodies: THREE.Mesh[] = [];
  private stickers: THREE.Mesh[];
  private labels: THREE.Mesh[];
  private stickerMaterials: THREE.Material[];
  private greyMaterial = new THREE.MeshStandardMaterial({ color: GREYED_OUT, roughness: 0.3, flatShading: true });
  private labelsVisible = false;
  private focus: PieceFocus = "all";

  constructor() {
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = "Cube_Root";
    this.rootGroup.scale.setScalar(CUBE_SCALE);

    this.staticGroup = new THREE.Group();
    this.rootGroup.add(this.staticGroup);
    this.pivotGroup = new THREE.Group();
    this.rootGroup.add(this.pivotGroup);

    const bodyGeometry = new THREE.BoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: DARK, roughness: 0.8, flatShading: true });
    for (const x of [-1, 0, 1]) for (const y of [-1, 0, 1]) for (const z of [-1, 0, 1]) {
      if (x === 0 && y === 0 && z === 0) continue;
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.userData.home = [x, y, z];
      this.bodies.push(body);
      this.staticGroup.add(body);
    }

    const stickerGeometry = new THREE.PlaneGeometry(STICKER_SIZE, STICKER_SIZE);
    const materials = Object.fromEntries(
      FACES.map((face) => [face, new THREE.MeshStandardMaterial({ color: FACE_COLORS[face], roughness: 0.3, flatShading: true })])
    );
    this.stickers = FACELETS.map((_, id) => {
      const sticker = new THREE.Mesh(stickerGeometry, materials[FACES[Math.floor(id / 9)]]);
      this.staticGroup.add(sticker);
      return sticker;
    });
    this.stickerMaterials = this.stickers.map((sticker) => sticker.material as THREE.Material);

    // Letters mark fixed locations on the cube's shell (Speffz), not the stickers passing through
    // them, so they sit a hair further out than the stickers and never move on turns or scrambles.
    const labelGeometry = new THREE.PlaneGeometry(LABEL_SIZE, LABEL_SIZE);
    this.labels = FACELETS.flatMap((facelet, id) => {
      const letter = FACELET_LETTERS[id];
      if (!letter) return [];
      const material = new THREE.MeshBasicMaterial({ map: letterTexture(letter), transparent: true, depthWrite: false });
      const label = new THREE.Mesh(labelGeometry, material);
      const n = new THREE.Vector3(...facelet.normal);
      label.position.set(...facelet.pos).addScaledVector(n, CUBIE_SIZE / 2 + 0.01);
      label.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
      label.visible = false;
      label.userData.type = pieceTypeOf(id);
      this.staticGroup.add(label);
      return [label];
    });

    this.applyState(Cube.createSolved());
  }

  public setLabelsVisible(visible: boolean): void {
    this.labelsVisible = visible;
    this.applyFocus();
  }

  // Greys out the other piece type's stickers and hides its letters. Centers always keep their color.
  public setFocus(focus: PieceFocus): void {
    this.focus = focus;
    this.applyFocus();
  }

  private applyFocus(): void {
    const inFocus = (type: PieceType | "center") => this.focus === "all" || type === "center" || type === this.focus;
    this.labels.forEach((label) => (label.visible = this.labelsVisible && inFocus(label.userData.type)));
    this.stickers.forEach((sticker, id) => {
      sticker.material = inFocus(pieceTypeOf(id)) ? this.stickerMaterials[id] : this.greyMaterial;
    });
  }

  // Snaps every mesh to `state`, instantly - no animation.
  public applyState(state: Cube): void {
    this.bodies.forEach((body) => {
      body.position.set(...(body.userData.home as Vec3));
      body.quaternion.identity();
    });
    state.facelets.forEach((id, location) => {
      const { pos, normal } = FACELETS[location];
      const n = new THREE.Vector3(...normal);
      const sticker = this.stickers[id];
      sticker.position.set(...pos).addScaledVector(n, CUBIE_SIZE / 2 + 0.005);
      sticker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    });
  }

  // Animates one move token. `before` is read only to find which stickers sit in the turning layers.
  public async animateMove(before: Cube, token: string, durationMs: number = 250): Promise<void> {
    const { axis, layers, quarterTurns } = parseMove(token);
    const meshes = [
      ...this.bodies.filter((body) => layers.includes((body.userData.home as Vec3)[axis])),
      ...before.facelets.filter((_, location) => layers.includes(FACELETS[location].pos[axis])).map((id) => this.stickers[id]),
    ];

    this.pivotGroup.rotation.set(0, 0, 0);
    this.pivotGroup.updateMatrixWorld(true);
    meshes.forEach((mesh) => this.pivotGroup.attach(mesh));

    const target = (quarterTurns * Math.PI) / 2;
    const rotationAxis = (["x", "y", "z"] as const)[axis];
    const startTime = performance.now();
    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        const progress = Math.min(1, (now - startTime) / durationMs);
        this.pivotGroup.rotation[rotationAxis] = target * easeInOutCubic(progress);
        if (progress < 1) {
          safeRequestAnimationFrame(step);
          return;
        }
        resolve();
      };
      safeRequestAnimationFrame(step);
    });

    meshes.forEach((mesh) => this.staticGroup.attach(mesh));
    this.pivotGroup.rotation.set(0, 0, 0);
  }
}

function safeRequestAnimationFrame(cb: (time: number) => void): void {
  if (typeof requestAnimationFrame !== "undefined") {
    requestAnimationFrame(cb);
  } else {
    setTimeout(() => cb(performance.now()), 16);
  }
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
