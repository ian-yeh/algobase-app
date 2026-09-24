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
  return dispose;
}
