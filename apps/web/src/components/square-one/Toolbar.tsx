import React from "react";
import { PresetMenu } from "./PresetMenu";

const MoveButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
> = ({ children, className, ...props }) => (
  <button
    {...props}
    className={`font-mono text-[11px] leading-none rounded-md border border-foreground/10 text-foreground/45 px-2 py-1.5 hover:border-foreground/25 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${className ?? ""}`}
  >
    {children}
  </button>
);

const MoveGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center gap-1">
    <span className="font-mono text-[11px] text-foreground/35 mr-0.5">{label}</span>
    {children}
  </div>
);

export const Toolbar: React.FC<{
  isBusy: boolean;
  canSlice: boolean;
  onTurnTop: (steps: number) => void;
  onTurnBottom: (steps: number) => void;
  onSlice: () => void;
  onScramble: () => void;
  onReset: () => void;
  onRunPreset: (sequence: string) => void;
  onRevealCsp: () => void;
}> = ({ isBusy, canSlice, onTurnTop, onTurnBottom, onSlice, onScramble, onReset, onRunPreset, onRevealCsp }) => (
  <div className="absolute inset-x-0 bottom-0 border-t border-foreground/10 bg-background/85 backdrop-blur-md px-3 py-2 sm:px-4">
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <MoveGroup label="U">
        <MoveButton onClick={() => onTurnTop(-1)} disabled={isBusy} aria-label="Rotate top layer -30°">
          -1
        </MoveButton>
        <MoveButton onClick={() => onTurnTop(1)} disabled={isBusy} aria-label="Rotate top layer +30°">
          +1
        </MoveButton>
      </MoveGroup>

      <MoveGroup label="D">
        <MoveButton onClick={() => onTurnBottom(-1)} disabled={isBusy} aria-label="Rotate bottom layer -30°">
          -1
        </MoveButton>
        <MoveButton onClick={() => onTurnBottom(1)} disabled={isBusy} aria-label="Rotate bottom layer +30°">
          +1
        </MoveButton>
      </MoveGroup>

      <button
        onClick={onSlice}
        disabled={!canSlice}
        title={canSlice ? "Slice" : "Slice Blocked! Seam misaligned."}
        className={`font-mono text-[13px] leading-none rounded-md border px-2.5 py-1.5 transition-colors ${
          canSlice
            ? "border-accent/30 text-accent hover:bg-accent/10 cursor-pointer"
            : "border-foreground/10 text-foreground/45/50 cursor-not-allowed"
        }`}
      >
        /
      </button>

      <div className="hidden sm:block h-4 w-px bg-border" />

      <button
        onClick={onScramble}
        className="text-xs font-medium rounded-md bg-foreground text-background px-3 py-1.5 hover:opacity-85 transition-opacity"
      >
        Scramble
      </button>
      <button
        onClick={onReset}
        className="text-xs font-medium text-foreground/45 hover:text-foreground px-1 py-1.5 transition-colors"
      >
        Reset
      </button>

      <button
        onClick={onRevealCsp}
        className="text-xs font-medium text-foreground/45 hover:text-foreground px-1 py-1.5 transition-colors"
      >
        Reveal Case
      </button>

      <PresetMenu disabled={isBusy} onRunPreset={onRunPreset} />
    </div>
  </div>
);
