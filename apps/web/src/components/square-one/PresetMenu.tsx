import React, { useEffect, useRef, useState } from "react";
import { PRESET_ALGORITHMS } from "@algobase/square-one";

export const PresetMenu: React.FC<{
  disabled: boolean;
  onRunPreset: (sequence: string) => void;
}> = ({ disabled, onRunPreset }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Preset algorithms"
        aria-label="Preset algorithms"
        className="font-mono text-[13px] leading-none rounded-md border border-foreground/10 text-foreground/45 px-2.5 py-1.5 hover:border-foreground/25 hover:text-foreground transition-colors"
      >
        &bull;&bull;&bull;
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 left-0 w-44 rounded-md border border-foreground/10 bg-background shadow-lg py-1 z-10">
          {PRESET_ALGORITHMS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                onRunPreset(preset.sequence);
                setOpen(false);
              }}
              disabled={disabled}
              className="block w-full text-left text-xs px-3 py-1.5 text-foreground/45 hover:bg-accent/10 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
