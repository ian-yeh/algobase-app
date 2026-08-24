import * as THREE from "three";
import { Square, type LayerCell } from "./square1";
import { createSquare1BaseGeometries, type Square1BaseGeometries, EQUATOR_EDGE_ANGLE_SPANS, EQUATOR_OUTER_SEGMENTS } from "./geometries";
import {
  RADIUS,
  HEIGHT_TOP,
  HEIGHT_MID,
  HEIGHT_BOTTOM,
  WHITE,
  YELLOW,
  DARK,
  OUTLINE,
  faceColorForSlot,
} from "./constants";

// Scene graph: rootGroup > staticGroup (stationary pieces) + pivotGroup (turn/slice animator).
// Turns/slices re-parent target meshes into pivotGroup, animate its rotation (Y for layer
// turns, Z for slices), then re-parent back to staticGroup, preserving world transforms.

export class Square1Renderer {
  public rootGroup: THREE.Group;
  public staticGroup: THREE.Group;
  public pivotGroup: THREE.Group;

  private state: Square;
  private geometries: Square1BaseGeometries;
  private outlineGeometries: Map<THREE.BufferGeometry, THREE.EdgesGeometry>;
  private outlineMaterial: THREE.LineBasicMaterial;
  private meshMap: Map<string, THREE.Mesh> = new Map();
  private isAnimating: boolean = false;

  constructor(state: Square = Square.createSolved()) {
    this.state = state;

    this.rootGroup = new THREE.Group();
    this.rootGroup.name = "Square1_Root";

    this.staticGroup = new THREE.Group();
    this.staticGroup.name = "Square1_StaticGroup";
    this.rootGroup.add(this.staticGroup);

    this.pivotGroup = new THREE.Group();
    this.pivotGroup.name = "Square1_PivotGroup";
    this.rootGroup.add(this.pivotGroup);

    this.geometries = createSquare1BaseGeometries(RADIUS, HEIGHT_TOP, HEIGHT_MID, HEIGHT_BOTTOM);
    this.outlineMaterial = new THREE.LineBasicMaterial({ color: OUTLINE });
    this.outlineGeometries = new Map(
      Object.values(this.geometries).map((geom) => [geom, new THREE.EdgesGeometry(geom, 15)])
    );

    this.buildScene();
  }

  public getState(): Square {
    return this.state;
  }

  // Resets to a solved state and rebuilds the scene from it.
  public resetState(): void {
    this.state = Square.createSolved();
    this.buildScene();
  }

  public getIsAnimating(): boolean {
    return this.isAnimating;
  }

  // Builds piece meshes for top, bottom, and middle layers and attaches them to staticGroup.
  public buildScene(): void {
    this.meshMap.forEach((mesh) => {
      this.staticGroup.remove(mesh);
      mesh.geometry.dispose();
    });
    this.meshMap.clear();

    const topLayer = this.state.getTopLayer();
    const bottomLayer = this.state.getBottomLayer();

    this.createLayerMeshes(topLayer, 'top', HEIGHT_TOP / 2 + HEIGHT_MID / 2);
    this.createLayerMeshes(bottomLayer, 'bot', -(HEIGHT_BOTTOM / 2 + HEIGHT_MID / 2));
    this.createEquatorMeshes();
  }

  // Top layer turn by `u` slots (multiples of 30°).
  public async turnTop(u: number, durationMs: number = 300): Promise<void> {
    if (u === 0 || this.isAnimating) return;
    this.isAnimating = true;

    const topMeshes = this.getLayerMeshes('top');
    this.attachToPivot(topMeshes);

    const targetAngleY = -THREE.MathUtils.degToRad(u * 30);
    await this.animatePivotRotationY(targetAngleY, durationMs);

    this.detachFromPivot(topMeshes);
    this.state.rotateTop(u);

    this.isAnimating = false;
  }

  // Bottom layer turn by `d` slots (multiples of 30°). D's +/- is inverted relative to
  // U: physically turning the bottom layer clockwise (as viewed from below, the way you'd
  // naturally grip it) is a negative step in this engine's shared top/bottom sign convention.
  public async turnBottom(d: number, durationMs: number = 300): Promise<void> {
    d = -d;
    if (d === 0 || this.isAnimating) return;
    this.isAnimating = true;

    const botMeshes = this.getLayerMeshes('bot');
    this.attachToPivot(botMeshes);

    const targetAngleY = -THREE.MathUtils.degToRad(d * 30);
    await this.animatePivotRotationY(targetAngleY, durationMs);

    this.detachFromPivot(botMeshes);
    this.state.rotateBottom(d);

    this.isAnimating = false;
  }

  // Top (u) and bottom (d) turns simultaneously, each on its own temporary pivot.
  public async turnBoth(u: number, d: number, durationMs: number = 300): Promise<void> {
    if (u === 0 && d === 0) return;
    if (u !== 0 && d === 0) return this.turnTop(u, durationMs);
    if (u === 0 && d !== 0) return this.turnBottom(d, durationMs);

    d = -d;
    this.isAnimating = true;

    const tempTopPivot = new THREE.Group();
    const tempBotPivot = new THREE.Group();
    this.rootGroup.add(tempTopPivot);
    this.rootGroup.add(tempBotPivot);

    const topMeshes = this.getLayerMeshes('top');
    const botMeshes = this.getLayerMeshes('bot');

    topMeshes.forEach((m) => tempTopPivot.attach(m));
    botMeshes.forEach((m) => tempBotPivot.attach(m));

    const targetTopY = -THREE.MathUtils.degToRad(u * 30);
    const targetBotY = -THREE.MathUtils.degToRad(d * 30);

    const startTime = performance.now();

    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        const ease = easeInOutCubic(progress);

        tempTopPivot.rotation.y = targetTopY * ease;
        tempBotPivot.rotation.y = targetBotY * ease;

        if (progress < 1) {
          safeRequestAnimationFrame(step);
        } else {
          tempTopPivot.rotation.y = targetTopY;
          tempBotPivot.rotation.y = targetBotY;

          topMeshes.forEach((m) => this.staticGroup.attach(m));
          botMeshes.forEach((m) => this.staticGroup.attach(m));

          this.rootGroup.remove(tempTopPivot);
          this.rootGroup.remove(tempBotPivot);

          this.state.rotate(u, d);
          this.isAnimating = false;
          resolve();
        }
      };
      safeRequestAnimationFrame(step);
    });
  }

  // Slice move (/): swaps right-half meshes (slots 0..5) of top/bottom and flips which
  // equator half is in front.
  public async slice(durationMs: number = 400): Promise<boolean> {
    if (this.isAnimating) return false;
    if (!this.state.canSlice()) return false;

    this.isAnimating = true;

    const sliceMoveMeshes = this.getSliceMoveMeshes();
    this.attachToPivot(sliceMoveMeshes);

    const targetAngleZ = Math.PI; // 180° around the slice axis (Z)
    await this.animatePivotRotationZ(targetAngleZ, durationMs);

    this.detachFromPivot(sliceMoveMeshes);
    this.state.slice();

    this.isAnimating = false;
    return true;
  }

  // Attaches meshes to pivotGroup, preserving world transforms.
  public attachToPivot(meshes: THREE.Mesh[]): void {
    this.pivotGroup.rotation.set(0, 0, 0);
    this.pivotGroup.position.set(0, 0, 0);
    this.pivotGroup.scale.set(1, 1, 1);
    this.pivotGroup.updateMatrixWorld(true);

    meshes.forEach((mesh) => {
      this.pivotGroup.attach(mesh);
    });
  }

  // Re-attaches meshes from pivotGroup back to staticGroup.
  public detachFromPivot(meshes: THREE.Mesh[]): void {
    meshes.forEach((mesh) => {
      this.staticGroup.attach(mesh);
    });

    this.pivotGroup.rotation.set(0, 0, 0);
    this.pivotGroup.position.set(0, 0, 0);
    this.pivotGroup.scale.set(1, 1, 1);
    this.pivotGroup.updateMatrixWorld(true);
  }

  // --------------------------------------------------------------------------
  // Mesh Identification & Creation Helpers
  // --------------------------------------------------------------------------

  private getLayerMeshes(layer: 'top' | 'bot'): THREE.Mesh[] {
    const cells = layer === 'top' ? this.state.getTopLayer() : this.state.getBottomLayer();
    const seenIds = new Set<string>();
    const meshes: THREE.Mesh[] = [];

    cells.forEach((c) => {
      if (!seenIds.has(c.piece.id)) {
        seenIds.add(c.piece.id);
        const mesh = this.meshMap.get(c.piece.id);
        if (mesh) meshes.push(mesh);
      }
    });

    return meshes;
  }

  private getSliceMoveMeshes(): THREE.Mesh[] {
    const topLayer = this.state.getTopLayer();
    const bottomLayer = this.state.getBottomLayer();
    const seenIds = new Set<string>();
    const meshes: THREE.Mesh[] = [];

    for (let i = 0; i < 6; i++) {
      const topPieceId = topLayer[i].piece.id;
      const botPieceId = bottomLayer[i].piece.id;

      if (!seenIds.has(topPieceId)) {
        seenIds.add(topPieceId);
        const m = this.meshMap.get(topPieceId);
        if (m) meshes.push(m);
      }

      if (!seenIds.has(botPieceId)) {
        seenIds.add(botPieceId);
        const m = this.meshMap.get(botPieceId);
        if (m) meshes.push(m);
      }
    }

    const m1Mesh = this.meshMap.get("mid-M1");
    if (m1Mesh) meshes.push(m1Mesh);

    return meshes;
  }

  private createLayerMeshes(cells: ReadonlyArray<LayerCell>, layer: 'top' | 'bot', yPos: number): void {
    const seenIds = new Set<string>();
    const capColor = layer === 'top' ? WHITE : YELLOW;

    cells.forEach((cell, slotIndex) => {
      const { piece } = cell;
      if (seenIds.has(piece.id)) return;
      seenIds.add(piece.id);

      const isCorner = piece.type === 'corner';
      const geom = isCorner
        ? layer === 'top' ? this.geometries.cornerTop : this.geometries.cornerBottom
        : layer === 'top' ? this.geometries.edgeTop : this.geometries.edgeBottom;

      const materials = isCorner
        ? this.createWedgeMaterials(capColor, faceColorForSlot(slotIndex), faceColorForSlot(slotIndex + 1))
        : this.createWedgeMaterials(capColor, faceColorForSlot(slotIndex), faceColorForSlot(slotIndex));
      const mesh = new THREE.Mesh(geom, materials);
      mesh.name = piece.id;
      mesh.add(this.createOutline(geom));

      mesh.position.set(0, yPos, 0);

      const slotAngleRad = THREE.MathUtils.degToRad(slotIndex * 30);
      mesh.rotation.y = -slotAngleRad; // counter-clockwise around Y to align with radial slots

      this.staticGroup.add(mesh);
      this.meshMap.set(piece.id, mesh);
    });
  }

  private createEquatorMeshes(): void {
    const matM1 = this.createTrapezoidMaterials(0);
    const meshM1 = new THREE.Mesh(this.geometries.equator, matM1);
    meshM1.name = "mid-M1";
    meshM1.add(this.createOutline(this.geometries.equator));
    meshM1.position.set(0, 0, 0);
    meshM1.rotation.y = 0;
    this.staticGroup.add(meshM1);
    this.meshMap.set("mid-M1", meshM1);

    const matM2 = this.createTrapezoidMaterials(180);
    const meshM2 = new THREE.Mesh(this.geometries.equator, matM2);
    meshM2.name = "mid-M2";
    meshM2.add(this.createOutline(this.geometries.equator));
    meshM2.position.set(0, 0, 0);
    meshM2.rotation.y = Math.PI;
    this.staticGroup.add(meshM2);
    this.meshMap.set("mid-M2", meshM2);
  }

  private createOutline(geom: THREE.BufferGeometry): THREE.LineSegments {
    const edges = this.outlineGeometries.get(geom)!;
    return new THREE.LineSegments(edges, this.outlineMaterial);
  }

  private createWedgeMaterials(capColor: string, colorSideB: string, colorSideA: string): THREE.Material[] {
    const matCapLow = new THREE.MeshStandardMaterial({ color: capColor, roughness: 0.3, flatShading: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const matCapHigh = new THREE.MeshStandardMaterial({ color: capColor, roughness: 0.3, flatShading: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const matInner = new THREE.MeshStandardMaterial({ color: DARK, roughness: 0.8, side: THREE.DoubleSide, flatShading: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });

    // matSideA covers the wedge's higher-angle half (slotIndex+1), matSideB
    // the lower-angle half (slotIndex) - see setupWedgeMaterialGroups
    const matSideA = new THREE.MeshStandardMaterial({ color: colorSideA, roughness: 0.3, flatShading: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const matSideB = new THREE.MeshStandardMaterial({ color: colorSideB, roughness: 0.3, flatShading: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });

    return [matCapLow, matCapHigh, matInner, matSideA, matSideB];
  }

  // angleOffsetDeg is 0 for M1 (world 0-180) and 180 for M2 (world 180-360);
  // outer wall segments are colored per their real face position so the band
  // reads as a continuation of the top/bottom stickers, not a flat dark wall
  private createTrapezoidMaterials(angleOffsetDeg: number): THREE.Material[] {
    const matCap = new THREE.MeshStandardMaterial({ color: DARK, roughness: 0.8, side: THREE.DoubleSide, flatShading: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const matInner = new THREE.MeshStandardMaterial({ color: DARK, roughness: 0.8, side: THREE.DoubleSide, flatShading: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });

    const materials: THREE.Material[] = [matCap, matCap, matInner];
    EQUATOR_EDGE_ANGLE_SPANS.forEach(([a0, a1], i) => {
      const color = faceColorForSlot(Math.floor((angleOffsetDeg + (a0 + a1) / 2) / 30));
      const k = i + 1;
      materials[3 + (k % EQUATOR_OUTER_SEGMENTS)] = new THREE.MeshStandardMaterial({ color, roughness: 0.3, flatShading: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    });

    return materials;
  }

  // --------------------------------------------------------------------------
  // Smooth Pivot Animation Helpers
  // --------------------------------------------------------------------------

  private animatePivotRotationY(targetAngleY: number, durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        const ease = easeInOutCubic(progress);

        this.pivotGroup.rotation.y = targetAngleY * ease;

        if (progress < 1) {
          safeRequestAnimationFrame(step);
        } else {
          this.pivotGroup.rotation.y = targetAngleY;
          resolve();
        }
      };
      safeRequestAnimationFrame(step);
    });
  }

  private animatePivotRotationZ(targetAngleZ: number, durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        const ease = easeInOutCubic(progress);

        this.pivotGroup.rotation.z = targetAngleZ * ease;

        if (progress < 1) {
          safeRequestAnimationFrame(step);
        } else {
          this.pivotGroup.rotation.z = targetAngleZ;
          resolve();
        }
      };
      safeRequestAnimationFrame(step);
    });
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
