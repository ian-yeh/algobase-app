import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuthStore } from "@/stores/authStore";
import { getEffectiveCspAlg, type CspCustomization } from "@/lib/cspCustomAlg";
import { ArrowUpDown, RotateCcw } from "lucide-react";
import { getReferenceSetup, type CspCase, type CspParity } from "@algobase/square-one";
import { StaticSquareOne } from "./StaticSquareOne";

const AlgField: React.FC<{
  cspCase: CspCase;
  parity: CspParity;
  displayLabel: string;
  override?: string;
}> = ({ cspCase, parity, displayLabel, override }) => {
  const token = useAuthStore((s) => s.token);
  const setCustomization = useMutation(api.cspCustomization.setCspCustomization);
  const field = parity === "even" ? "evenAlg" : "oddAlg";
  const alg = getEffectiveCspAlg(cspCase, parity, override ? { [field]: override } : null);
  const [value, setValue] = useState(alg.sequence);

  const commit = (next: string) => {
    if (!token || next === (override ?? alg.sequence)) return;
    setCustomization({ token, caseId: cspCase.id, field, value: next });
  };

  const reset = () => {
    setValue(getEffectiveCspAlg(cspCase, parity, null).sequence);
    if (token) setCustomization({ token, caseId: cspCase.id, field, value: "" });
  };

  return (
    <div className="flex items-start gap-1 rounded border border-foreground/10 px-1.5 py-1">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-foreground/45 mb-0.5">
          <span>{displayLabel}</span>
          {override && (
            <button onClick={reset} title="Reset to stock algorithm" className="text-foreground/45 hover:text-foreground">
              <RotateCcw className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
        <input
          value={value}
          disabled={!token}
          onChange={(e) => setValue(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          placeholder={alg.label}
          className="w-full bg-transparent text-foreground focus:outline-none disabled:opacity-60"
        />
      </div>
    </div>
  );
};

export const CspCaseRow: React.FC<{
  cspCase: CspCase;
  learned: boolean;
  customization?: CspCustomization | null;
}> = ({ cspCase, learned, customization }) => {
  const token = useAuthStore((s) => s.token);
  const setLearned = useMutation(api.cspProgress.setCspCaseLearned);
  const setCustomization = useMutation(api.cspCustomization.setCspCustomization);
  const setSwapped = useMutation(api.cspCustomization.setCspSwapped);
  const [notes, setNotes] = useState(customization?.notes ?? "");

  const swapped = customization?.swapped ?? false;
  const toggleSwap = () => {
    if (!token) return;
    setSwapped({ token, caseId: cspCase.id, swapped: !swapped });
  };

  const referenceAlg = getEffectiveCspAlg(cspCase, cspCase.evenAlg ? "even" : "odd", customization);
  // "Even" always sits on top; swapping moves which physical algorithm shows there instead of relabeling the slots.
  const topParity: CspParity = swapped ? "odd" : "even";
  const bottomParity: CspParity = swapped ? "even" : "odd";

  return (
    <div className="grid grid-cols-[8rem_1fr_1fr] gap-3 border-b border-foreground/10 py-3 text-xs font-mono items-start">
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-1.5 text-foreground/70">
          <input
            type="checkbox"
            checked={learned}
            disabled={!token}
            onChange={(e) => token && setLearned({ token, caseId: cspCase.id, learned: e.target.checked })}
            className="h-3 w-3 accent-accent disabled:opacity-40"
          />
          {cspCase.topShape} / {cspCase.bottomShape}
        </label>
        <StaticSquareOne sequence={getReferenceSetup(referenceAlg)} className="h-24 w-full" />
      </div>
      <div className="flex flex-col gap-1">
        <AlgField
          key={topParity}
          cspCase={cspCase}
          parity={topParity}
          displayLabel="even"
          override={topParity === "even" ? customization?.evenAlg : customization?.oddAlg}
        />
        <button
          onClick={toggleSwap}
          disabled={!token}
          title="Swap even/odd for this case"
          className="self-center text-foreground/35 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowUpDown className="h-3 w-3" />
        </button>
        <AlgField
          key={bottomParity}
          cspCase={cspCase}
          parity={bottomParity}
          displayLabel="odd"
          override={bottomParity === "even" ? customization?.evenAlg : customization?.oddAlg}
        />
      </div>
      <textarea
        value={notes}
        disabled={!token}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={(e) => {
          if (!token || e.target.value === (customization?.notes ?? "")) return;
          setCustomization({ token, caseId: cspCase.id, field: "notes", value: e.target.value });
        }}
        placeholder="Notes..."
        rows={3}
        className="w-full resize-none rounded border border-foreground/10 bg-transparent px-1.5 py-1 text-foreground focus:outline-none disabled:opacity-60"
      />
    </div>
  );
};

export default CspCaseRow;
