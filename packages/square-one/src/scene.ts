import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Square } from "./square1";
import { Square1Renderer } from "./renderer";
import { Square1Queue, type MoveTask, type QueueOptions } from "./queue";

export interface UseSquare1SceneOptions {
  autoRotate: boolean;
  initialSequence: string;
  onMoveStart: () => void;
  onMoveComplete: (task: MoveTask, currentState: Square) => void;
  onQueueEmpty: () => void;
  onSliceBlocked: () => void;
}

// Sets up the Three.js scene/camera/lights/controls for a Square1Renderer (view) inside containerRef, wires it to a Square1Queue (state machine), and tears everything down on unmount. Callers should only ever talk to the returned queue - it's the sole source of truth for puzzle state.
export function useSquare1Scene(containerRef: React.RefObject<HTMLDivElement | null>, options: UseSquare1SceneOptions) {
  const queueRef = useRef<Square1Queue | null>(null);
  const optionsRef = useRef(options);
  const hasAppliedInitialRef = useRef(false);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#ffffff");
    scene.fog = new THREE.Fog("#ffffff", 8, 16);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(3.5, 3.0, 5.2);

    // Render at a fraction of the container's resolution and let the browser scale the canvas back up with nearest-neighbor sampling: chunky, PS1-era pixels instead of a smooth render, matching this being a dev site rather than a product shot.
    const PIXEL_SCALE = 0.7;
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

    const controls = new OrbitControls(camera, webglRenderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 9;
    controls.autoRotate = optionsRef.current.autoRotate;
    controls.autoRotateSpeed = 1.0;

    // Flat base level so no face - whichever way the puzzle is turned - ever reads as near-black; the directional lights below add shape on top of this.
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight("#ffffff", "#cfd3da", 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.7);
    fillLight.position.set(-5, 2, -4);
    scene.add(fillLight);

    // keyLight/fillLight both sit on the left/front, leaving the right/back side dark whenever the puzzle turns that way into view - light it directly.
    const rightFillLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rightFillLight.position.set(6, 3, -3);
    scene.add(rightFillLight);

    // Every other light sits above the puzzle, so the downward-facing bottom cap never catches a direct hit — bounce a soft light up from below to fill it.
    const bottomFillLight = new THREE.DirectionalLight(0xffffff, 0.9);
    bottomFillLight.position.set(0, -6, 3);
    scene.add(bottomFillLight);

    const sqRenderer = new Square1Renderer();
    sqRenderer.rootGroup.rotation.y = THREE.MathUtils.degToRad(135);
    scene.add(sqRenderer.rootGroup);

    const queueOptions: QueueOptions = {
      defaultDurationMs: 250,
      onMoveStart: () => optionsRef.current.onMoveStart(),
      onMoveComplete: (task, currentState) => optionsRef.current.onMoveComplete(task, currentState),
      onQueueEmpty: () => optionsRef.current.onQueueEmpty(),
      onSliceBlocked: () => optionsRef.current.onSliceBlocked(),
    };
    const queue = new Square1Queue(sqRenderer, queueOptions);
    queueRef.current = queue;

    if (optionsRef.current.initialSequence) {
      // First build (e.g. the popup opening) sets up the starting position instantly; later rebuilds (e.g. toggling even/odd, which changes initialSequence) play it.
      if (hasAppliedInitialRef.current) {
        queue.enqueueSequence(optionsRef.current.initialSequence);
      } else {
        queue.applyInstant(optionsRef.current.initialSequence);
      }
    }
    hasAppliedInitialRef.current = true;

    let animFrameId: number;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      controls.update();
      webglRenderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
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
      webglRenderer.dispose();
      if (container.contains(webglRenderer.domElement)) {
        container.removeChild(webglRenderer.domElement);
      }
    };
  }, [containerRef, options.autoRotate, options.initialSequence]);

  return { queueRef };
}
