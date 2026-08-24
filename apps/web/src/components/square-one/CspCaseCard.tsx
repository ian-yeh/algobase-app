import { useState } from "react";
import { getReferenceSetup, getCspAlg, type CspCase, type CspParity } from "@algobase/square-one";
import { StaticSquareOne } from "./StaticSquareOne";

export const CspCaseCard: React.FC<{ cspCase: CspCase }> = ({ cspCase }) => {
  const [parity, setParity] = useState<CspParity>(cspCase.evenAlg ? "even" : "odd");
  const alg = getCspAlg(cspCase, parity);

  return (
    <div className="flex flex-col rounded-lg border border-foreground/10 p-2 text-xs font-mono">
      <div className="text-foreground/45 mb-1">
        {cspCase.topShape} / {cspCase.bottomShape}
      </div>
      <StaticSquareOne sequence={getReferenceSetup(alg)} className="h-32 w-full" />
      <div className="flex items-center gap-1 mt-1">
        {(["even", "odd"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setParity(p)}
            className={`rounded border px-1.5 py-0.5 transition-colors ${
              parity === p
                ? "border-accent/30 text-accent bg-accent/10"
                : "border-foreground/20 text-foreground/45 hover:text-foreground"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="text-foreground mt-1 break-words">{alg.sequence || alg.label}</div>
    </div>
  );
};

export default CspCaseCard;
