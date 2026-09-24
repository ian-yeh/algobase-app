import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Cube } from "./cube";
import { CubeRenderer } from "./renderer";
import { CubeQueue, type MoveTask, type QueueOptions } from "./queue";

// Render at a fraction of the container's resolution and let the browser scale the canvas back up with nearest-neighbor sampling - the same chunky pixel look as the Square-1.
const PIXEL_SCALE = 0.7;

export interface UseCubeSceneOptions {
  autoRotate: boolean;
  initialSequence: string;
  onMoveStart: () => void;
  onMoveComplete: (task: MoveTask, currentState: Cube) => void;
  onQueueEmpty: () => void;
}

// Scene, camera, renderer and lights shared by the interactive scene and the static thumbnail - identical to the Square-1 setup.
export function createStage(container: HTMLDivElement, fallbackWidth: number, fallbackHeight: number) {
  const width = container.clientWidth || fallbackWidth;
  const height = container.clientHeight || fallbackHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(3.5, 3.0, 5.2);
  camera.lookAt(0, 0, 0);

  const webglRenderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  webglRenderer.setPixelRatio(1);
  webglRenderer.setSize(width * PIXEL_SCALE, height * PIXEL_SCALE, false);
  webglRenderer.domElement.style.width = "100%";
  webglRenderer.domElement.style.height = "100%";
  webglRenderer.domElement.style.imageRendering = "pixelated";
  webglRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  webglRenderer.toneMappingExposure = 1.1;
  webglRenderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(webglRenderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  scene.add(new THREE.HemisphereLight("#ffffff", "#cfd3da", 0.9));
  const lights: [number, THREE.Vector3Tuple][] = [
    [1.8, [5, 8, 5]],
    [0.7, [-5, 2, -4]],
    [0.9, [6, 3, -3]],
    [0.9, [0, -6, 3]],
  ];
  for (const [intensity, position] of lights) {
    const light = new THREE.DirectionalLight(0xffffff, intensity);
    light.position.set(...position);
    scene.add(light);
  }

  const dispose = () => {
    webglRenderer.dispose();
    if (container.contains(webglRenderer.domElement)) container.removeChild(webglRenderer.domElement);
  };

  return { scene, camera, webglRenderer, dispose };
}

// Sets up the Three.js stage for a CubeRenderer inside containerRef, wires it to a CubeQueue (state machine), and tears everything down on unmount. Callers should only ever talk to the returned queue - it's the sole source of truth for puzzle state.
export function useCubeScene(containerRef: React.RefObject<HTMLDivElement | null>, options: UseCubeSceneOptions) {
  const queueRef = useRef<CubeQueue | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scene, camera, webglRenderer, dispose } = createStage(container, 400, 320);
    scene.background = new THREE.Color("#ffffff");
    scene.fog = new THREE.Fog("#ffffff", 8, 16);

    const controls = new OrbitControls(camera, webglRenderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 9;
    controls.autoRotate = optionsRef.current.autoRotate;
    controls.autoRotateSpeed = 1.0;

    const cubeRenderer = new CubeRenderer();
    scene.add(cubeRenderer.rootGroup);

    const queueOptions: QueueOptions = {
      defaultDurationMs: 250,
      onMoveStart: () => optionsRef.current.onMoveStart(),
      onMoveComplete: (task, currentState) => optionsRef.current.onMoveComplete(task, currentState),
      onQueueEmpty: () => optionsRef.current.onQueueEmpty(),
    };
    const queue = new CubeQueue(cubeRenderer, queueOptions);
    queueRef.current = queue;

    if (optionsRef.current.initialSequence) {
      queue.applyInstant(optionsRef.current.initialSequence);
    }

    let animFrameId: number;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      controls.update();
      webglRenderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      webglRenderer.setSize(w * PIXEL_SCALE, h * PIXEL_SCALE, false);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      dispose();
    };
  }, [containerRef, options.autoRotate, options.initialSequence]);

  return { queueRef };
}
