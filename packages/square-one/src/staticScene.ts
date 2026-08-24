import * as THREE from "three";
import { Square } from "./square1";
import { Square1Renderer } from "./renderer";

// Renders one non-interactive frame of a Square-1 posed by `sequence` (engine convention,
// e.g. from getReferenceSetup) - no OrbitControls, no move queue, no render loop. Meant
// for grids of many thumbnails at once, where an animated scene per cell would be wasteful.
export function renderStaticSquare1(container: HTMLDivElement, sequence: string): () => void {
  const width = container.clientWidth || 200;
  const height = container.clientHeight || 200;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(3.5, 3.0, 5.2);
  camera.lookAt(0, 0, 0);

  const PIXEL_SCALE = 0.7;
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.setPixelRatio(1);
  renderer.setSize(width * PIXEL_SCALE, height * PIXEL_SCALE, false);
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.imageRendering = "pixelated";
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  scene.add(new THREE.HemisphereLight("#ffffff", "#cfd3da", 0.9));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
  keyLight.position.set(5, 8, 5);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.7);
  fillLight.position.set(-5, 2, -4);
  scene.add(fillLight);
  const rightFillLight = new THREE.DirectionalLight(0xffffff, 0.9);
  rightFillLight.position.set(6, 3, -3);
  scene.add(rightFillLight);
  const bottomFillLight = new THREE.DirectionalLight(0xffffff, 0.9);
  bottomFillLight.position.set(0, -6, 3);
  scene.add(bottomFillLight);

  const state = Square.createSolved();
  state.executeSequence(sequence);
  const sqRenderer = new Square1Renderer(state);
  sqRenderer.rootGroup.rotation.y = THREE.MathUtils.degToRad(135);
  scene.add(sqRenderer.rootGroup);

  renderer.render(scene, camera);

  return () => {
    renderer.dispose();
    if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
  };
}
