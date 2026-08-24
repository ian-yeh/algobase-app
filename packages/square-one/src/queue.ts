import { Square, parseSequenceTokens } from "./square1";
import { Square1Renderer } from "./renderer";

// Async move/animation queue so rapid inputs, sequences, and scrambles don't glitch or desync.

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

      const defaultDur = this.options.defaultDurationMs || 300;

      if (task.type === "turn") {
        const duration = task.durationMs ?? defaultDur;
        await this.renderer.turnBoth(task.u, task.d, duration);
        this.options.onMoveComplete?.(task, this.renderer.getState());
      } else if (task.type === "slice") {
        const duration = task.durationMs ?? defaultDur;
        if (!this.renderer.getState().canSlice()) {
          this.options.onSliceBlocked?.();
        } else {
          await this.renderer.slice(duration);
          this.options.onMoveComplete?.(task, this.renderer.getState());
        }
      } else if (task.type === "sequence") {
        await this.processSequence(task.sequenceStr, task.durationPerMoveMs ?? defaultDur);
        this.options.onMoveComplete?.(task, this.renderer.getState());
      }
    }

    this.isProcessing = false;
    this.options.onQueueEmpty?.();
  }

  private async processSequence(sequenceStr: string, durationMs: number): Promise<void> {
    const tokens = parseSequenceTokens(sequenceStr);
    for (const token of tokens) {
      if (token === '/') {
        if (this.renderer.getState().canSlice()) {
          await this.renderer.slice(durationMs);
        } else {
          this.options.onSliceBlocked?.();
        }
      } else {
        const match = token.match(/^\(?\s*(-?\d+)\s*,\s*(-?\d+)\s*\)?$/);
        if (match) {
          await this.renderer.turnBoth(parseInt(match[1], 10), parseInt(match[2], 10), durationMs);
        }
      }
    }
  }
}
