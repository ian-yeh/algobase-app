import * as THREE from "three";
import { RADIUS, HEIGHT_TOP, HEIGHT_MID, HEIGHT_BOTTOM } from "./constants";

// Base geometries centered at the puzzle origin, built via ExtrudeGeometry from 2D profiles
// so the central Y-axis is the rotation axis and local mesh origins sit at (0,0,0).

export interface Square1BaseGeometries {
  cornerTop: THREE.BufferGeometry;
  cornerBottom: THREE.BufferGeometry;
  edgeTop: THREE.BufferGeometry;
  edgeBottom: THREE.BufferGeometry;
  equator: THREE.BufferGeometry;
}

// 60° corner wedge, spanning 0°-60° in the X-Z plane, extruded along Y.
export function createCornerGeometry(
  height: number = HEIGHT_TOP,
  radius: number = RADIUS
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);

  const rBoundary = radius / Math.cos(THREE.MathUtils.degToRad(15));
  const rApex = radius * Math.SQRT2;

  const a0 = 0;
  const a30 = THREE.MathUtils.degToRad(30);
  const a60 = THREE.MathUtils.degToRad(60);

  shape.lineTo(rBoundary * Math.cos(a0), rBoundary * Math.sin(a0)); // 0° boundary
  shape.lineTo(rApex * Math.cos(a30), rApex * Math.sin(a30)); // 30° apex (cube's vertical edge)
  shape.lineTo(rBoundary * Math.cos(a60), rBoundary * Math.sin(a60)); // 60° boundary
  shape.lineTo(0, 0);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
    curveSegments: 1,
  });

  orientExtrudedGeometry(geometry, height);
  setupWedgeMaterialGroups(geometry, 2); // 2 outer contour segments
  return geometry;
}

// 30° edge wedge, spanning 0°-30° in the X-Z plane, extruded along Y.
export function createEdgeGeometry(
  height: number = HEIGHT_TOP,
  radius: number = RADIUS
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);

  const rBoundary = radius / Math.cos(THREE.MathUtils.degToRad(15));
  const rMid = radius;

  const a0 = 0;
  const a15 = THREE.MathUtils.degToRad(15);
  const a30 = THREE.MathUtils.degToRad(30);

  shape.lineTo(rBoundary * Math.cos(a0), rBoundary * Math.sin(a0)); // 0° boundary
  shape.lineTo(rMid * Math.cos(a15), rMid * Math.sin(a15)); // 15° midpoint (cube's flat face)
  shape.lineTo(rBoundary * Math.cos(a30), rBoundary * Math.sin(a30)); // 30° boundary
  shape.lineTo(0, 0);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
    curveSegments: 1,
  });

  orientExtrudedGeometry(geometry, height);
  setupWedgeMaterialGroups(geometry, 2); // 2 outer contour segments (face line)
  return geometry;
}

// 180° half-band equator geometry centered at origin (0,0,0). The outer boundary
// retraces the same rBoundary/rApex/radius contour the corner and edge wedges use
// (matching 2 corners + 2 edges in a row - slots 0-5: C, C, E, C, C, E), so the
// middle layer's outer wall lines up flush with the top and bottom layers instead
// of bulging past or sitting recessed.
export function createEquatorGeometry(
  height: number = HEIGHT_MID,
  radius: number = RADIUS
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);

  const rBoundary = radius / Math.cos(THREE.MathUtils.degToRad(15));
  const rApex = radius * Math.SQRT2;

  for (const [deg, r] of EQUATOR_BOUNDARY_DEGREES_AND_RADII(rBoundary, rApex, radius)) {
    const rad = THREE.MathUtils.degToRad(deg);
    shape.lineTo(r * Math.cos(rad), r * Math.sin(rad));
  }
  shape.lineTo(0, 0);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
    curveSegments: 1,
  });

  orientExtrudedGeometry(geometry, height);
  setupWedgeMaterialGroups(geometry, EQUATOR_OUTER_SEGMENTS);
  return geometry;
}

// outer boundary points of a 180deg half-band, following the same
// rBoundary/rApex/radius pattern as two corners and two edges in a row
export const EQUATOR_OUTER_SEGMENTS = 8;
function EQUATOR_BOUNDARY_DEGREES_AND_RADII(
  rBoundary: number,
  rApex: number,
  radius: number
): [number, number][] {
  return [
    [0, rBoundary],
    [30, rApex],
    [60, rBoundary],
    [75, radius],
    [90, rBoundary],
    [120, rApex],
    [150, rBoundary],
    [165, radius],
    [180, rBoundary],
  ];
}

// angular span of each of the 8 outer boundary edges above, in order
export const EQUATOR_EDGE_ANGLE_SPANS: [number, number][] = [
  [0, 30],
  [30, 60],
  [60, 75],
  [75, 90],
  [90, 120],
  [120, 150],
  [150, 165],
  [165, 180],
];

export function createSquare1BaseGeometries(
  radius: number = RADIUS,
  heightTop: number = HEIGHT_TOP,
  heightMid: number = HEIGHT_MID,
  heightBot: number = HEIGHT_BOTTOM
): Square1BaseGeometries {
  return {
    cornerTop: createCornerGeometry(heightTop, radius),
    cornerBottom: createCornerGeometry(heightBot, radius),
    edgeTop: createEdgeGeometry(heightTop, radius),
    edgeBottom: createEdgeGeometry(heightBot, radius),
    equator: createEquatorGeometry(heightMid, radius),
  };
}

// ----------------------------------------------------------------------------
// Internal Helper Functions
// ----------------------------------------------------------------------------

// Re-orients ExtrudeGeometry so 2D (x, y) maps to 3D (x, z - height/2, y): extrusion runs
// along vertical Y, centered at Y=0, with local mesh origin preserved at (0,0,0).
function orientExtrudedGeometry(geometry: THREE.BufferGeometry, height: number): void {
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    pos.setXYZ(i, x, z - height / 2, y);
  }

  // swapping y/z above mirrors the geometry, which flips triangle winding;
  // swap each triangle's last two vertices (position + uv) back so outward
  // faces stay outward once normals are recomputed below
  const uv = geometry.attributes.uv;
  for (let i = 0; i < pos.count; i += 3) {
    swapVertices(pos, i + 1, i + 2);
    if (uv) swapVertices(uv, i + 1, i + 2);
  }

  geometry.computeVertexNormals();
}

function swapVertices(attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, a: number, b: number): void {
  for (let c = 0; c < attr.itemSize; c++) {
    const tmp = attr.getComponent(a, c);
    attr.setComponent(a, c, attr.getComponent(b, c));
    attr.setComponent(b, c, tmp);
  }
}

// Groups vertices for material assignment (lids, interior walls, side stickers).
function setupWedgeMaterialGroups(geometry: THREE.BufferGeometry, outerSegments: number): void {
  const position = geometry.attributes.position;
  const contourLength = outerSegments + 2; // outer points + axis (0,0)
  const sideCount = contourLength * 6; // 6 vertices per quad side
  const lidCount = position.count - sideCount;

  geometry.clearGroups();
  geometry.addGroup(0, lidCount / 2, 0); // lid low (bottom face)
  geometry.addGroup(lidCount / 2, lidCount / 2, 1); // lid high (top face)

  for (let k = 0; k < contourLength; k++) {
    const offset = lidCount + k * 6;
    let touchesAxis = false;

    for (let v = 0; v < 6; v++) {
      const x = position.getX(offset + v);
      const z = position.getZ(offset + v);
      if (Math.hypot(x, z) < 1e-5) touchesAxis = true;
    }

    // Material index 2 = inner plastic, 3+ = outer side stickers
    const matIndex = touchesAxis ? 2 : 3 + (k % outerSegments);
    geometry.addGroup(offset, 6, matIndex);
  }
}
