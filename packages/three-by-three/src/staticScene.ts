import { Cube } from "./cube";
import { CubeRenderer } from "./renderer";
import { createStage } from "./scene";

// Renders one non-interactive frame of a 3x3 posed by `sequence` - no controls, no queue, no render loop. Meant for grids of many thumbnails at once.
export function renderStaticCube(container: HTMLDivElement, sequence: string): () => void {
  const { scene, camera, webglRenderer, dispose } = createStage(container, 200, 200);

  const cubeRenderer = new CubeRenderer();
  cubeRenderer.applyState(Cube.createSolved().apply(sequence));
  scene.add(cubeRenderer.rootGroup);

  webglRenderer.render(scene, camera);
  return snapshot(container, webglRenderer.domElement, () => {
    webglRenderer.forceContextLoss();
    dispose();
  });
}

// Snapshot to an <img> and release the WebGL context right away - browsers cap live contexts (~16), so a grid of live canvases would start blanking out.
function snapshot(container: HTMLDivElement, canvas: HTMLCanvasElement, dispose: () => void): () => void {
  const img = document.createElement("img");
  img.src = canvas.toDataURL();
  img.style.cssText = "width:100%;height:100%;object-fit:contain;image-rendering:pixelated";
  img.alt = "";
  dispose();
  container.appendChild(img);
  return () => img.remove();
}

