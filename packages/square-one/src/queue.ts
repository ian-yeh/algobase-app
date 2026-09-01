import { Square, parseSequenceTokens } from "./square1";
import { physicalToEngineD } from "./square1.utils";
import { Square1Renderer } from "./renderer";

// The Square-1 state machine: owns the canonical Square state and decides every transition. Moves are queued so rapid input/sequences/scrambles can't glitch or desync; each move plays out on the (purely visual) renderer before being committed to state. All `d` here is "physical" notation - see square1.utils.physicalToEngineD.

export type MoveTask =
  | { type: "turn"; u: number; d: number; durationMs?: number }
  | { type: "slice"; durationMs?: number }
  | { type: "sequence"; sequenceStr: string; durationPerMoveMs?: number };

export interface QueueOptions {
  defaultDurationMs?: number;
  onMoveStart?: (task: MoveTask) => void;
  onMoveComplete?: (task: MoveTask, state: Square) => void;
  onQueueEmpty?: () => void;
  onSliceBlocked?: () => void;
}

export class Square1Queue {
  private state: Square = Square.createSolved();
  private renderer: Square1Renderer;
  private queue: MoveTask[] = [];
  private isProcessing: boolean = false;
  private options: QueueOptions;

  constructor(renderer: Square1Renderer, options: QueueOptions = {}) {
    this.renderer = renderer;
    this.options = {
      defaultDurationMs: 300,
      ...options,
    };
    this.renderer.applyState(this.state);
  }

  public getState(): Square {
    return this.state;
  }

  // Resets to solved and redraws instantly - no animation, no queueing.
  public resetState(): void {
    this.state = Square.createSolved();
    this.renderer.applyState(this.state);
  }

  // Applies a sequence directly to state and redraws once, instantly - for setting up a starting position rather than "playing" it.
  public applyInstant(sequenceStr: string): void {
    for (const token of parseSequenceTokens(sequenceStr)) {
      this.applyTokenToState(token);
    }
    this.renderer.applyState(this.state);
  }

  public enqueueTurn(u: number, d: number, durationMs?: number): void {
    this.queue.push({ type: "turn", u, d, durationMs });
    this.processNext();
  }

  public enqueueSlice(durationMs?: number): void {
    this.queue.push({ type: "slice", durationMs });
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

  public getPendingCount(): number {
    return this.queue.length;
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      this.options.onMoveStart?.(task);
      const defaultDur = this.options.defaultDurationMs ?? 300;

      if (task.type === "turn") {
        await this.turn(task.u, task.d, task.durationMs ?? defaultDur);
        this.options.onMoveComplete?.(task, this.state);
      } else if (task.type === "slice") {
        await this.slice(task.durationMs ?? defaultDur);
        this.options.onMoveComplete?.(task, this.state);
      } else if (task.type === "sequence") {
        await this.runSequence(task.sequenceStr, task.durationPerMoveMs ?? defaultDur);
        this.options.onMoveComplete?.(task, this.state);
      }
    }

    this.isProcessing = false;
    this.options.onQueueEmpty?.();
  }

  private async runSequence(sequenceStr: string, durationMs: number): Promise<void> {
    for (const token of parseSequenceTokens(sequenceStr)) {
      if (token === '/') {
        await this.slice(durationMs);
        continue;
      }
      const match = token.match(/^\(?\s*(-?\d+)\s*,\s*(-?\d+)\s*\)?$/);
      if (match) {
        await this.turn(parseInt(match[1], 10), parseInt(match[2], 10), durationMs);
      }
    }
  }

  // Plays the turn on the renderer (reading the pre-move state to find the moving meshes), then - and only then - commits it to state.
  private async turn(u: number, d: number, durationMs: number): Promise<void> {
    const dEngine = physicalToEngineD(d);
    if (u === 0 && dEngine === 0) return;
    await this.renderer.animateTurn(this.state, u, dEngine, durationMs);
    this.state.rotate(u, dEngine);
  }

  private async slice(durationMs: number): Promise<void> {
    if (!this.state.canSlice()) {
      this.options.onSliceBlocked?.();
      return;
    }
    await this.renderer.animateSlice(this.state, durationMs);
    this.state.slice();
  }

  private applyTokenToState(token: string): void {
    if (token === '/') {
      this.state.slice();
      return;
    }
    const match = token.match(/^\(?\s*(-?\d+)\s*,\s*(-?\d+)\s*\)?$/);
    if (match) {
      this.state.rotate(parseInt(match[1], 10), physicalToEngineD(parseInt(match[2], 10)));
    }
  }
}
