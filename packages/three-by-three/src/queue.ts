import { Cube, parseAlg } from "./cube";
import { CubeRenderer } from "./renderer";

// The 3x3 state machine: owns the canonical Cube state and decides every transition. Moves are queued so rapid input/sequences/scrambles can't glitch or desync; each move plays out on the (purely visual) renderer before being committed to state.

export type MoveTask =
  | { type: "move"; move: string; durationMs?: number }
  | { type: "sequence"; sequenceStr: string; durationPerMoveMs?: number };

export interface QueueOptions {
  defaultDurationMs?: number;
  onMoveStart?: (task: MoveTask) => void;
  onMoveComplete?: (task: MoveTask, state: Cube) => void;
  onQueueEmpty?: () => void;
}

export class CubeQueue {
  private state: Cube = Cube.createSolved();
  private renderer: CubeRenderer;
  private queue: MoveTask[] = [];
  private isProcessing: boolean = false;
  private options: QueueOptions;

  constructor(renderer: CubeRenderer, options: QueueOptions = {}) {
    this.renderer = renderer;
    this.options = {
      defaultDurationMs: 250,
      ...options,
    };
    this.renderer.applyState(this.state);
  }

  public getState(): Cube {
    return this.state;
  }

  // Resets to solved and redraws instantly - no animation, no queueing.
  public resetState(): void {
    this.state = Cube.createSolved();
    this.renderer.applyState(this.state);
  }

  // Applies a sequence directly to state and redraws once, instantly - for setting up a starting position rather than "playing" it.
  public applyInstant(sequenceStr: string): void {
    this.state.apply(sequenceStr);
    this.renderer.applyState(this.state);
  }

  public enqueueMove(move: string, durationMs?: number): void {
    this.queue.push({ type: "move", move, durationMs });
    this.processNext();
  }

  public enqueueSequence(sequenceStr: string, durationPerMoveMs?: number): void {
    this.queue.push({ type: "sequence", sequenceStr, durationPerMoveMs });
    this.processNext();
  }

  public clear(): void {
    this.queue = [];
  }

  public isBusy(): boolean {
    return this.isProcessing || this.queue.length > 0;
  }

  public setLabelsVisible(visible: boolean): void {
    this.renderer.setLabelsVisible(visible);
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      this.options.onMoveStart?.(task);
      const defaultDur = this.options.defaultDurationMs ?? 250;

      if (task.type === "move") {
        await this.move(task.move, task.durationMs ?? defaultDur);
      } else {
        for (const token of parseAlg(task.sequenceStr)) {
          await this.move(token, task.durationPerMoveMs ?? defaultDur);
        }
      }
      this.options.onMoveComplete?.(task, this.state);
    }

    this.isProcessing = false;
    this.options.onQueueEmpty?.();
  }

  // Plays the move on the renderer (reading the pre-move state to find the moving meshes), then - and only then - commits it to state and snaps the view to it.
  private async move(token: string, durationMs: number): Promise<void> {
    await this.renderer.animateMove(this.state, token, durationMs);
    this.state.move(token);
    this.renderer.applyState(this.state);
  }
}
