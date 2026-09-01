import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuthStore } from "@/stores/authStore";
import { CSP_CASES, type Shape } from "@algobase/square-one";
import { CspCaseRow } from "@/components/square-one/CspCaseRow";

const ALL_SHAPES: Shape[] = Array.from(
    new Set(CSP_CASES.flatMap((c) => [c.topShape, c.bottomShape]))
).sort();

const SquareOneCsp = () => {
    const [shapeFilter, setShapeFilter] = useState<Shape | "all">("all");
    const [learnedOnly, setLearnedOnly] = useState(false);
    const token = useAuthStore((s) => s.token);
    const progress = useQuery(api.cspProgress.getCspProgress, token ? { token } : "skip");
    const customizations = useQuery(api.cspCustomization.getCspCustomizations, token ? { token } : "skip");

    const learnedCount = progress ? Object.keys(progress).length : 0;

    const filteredCases = useMemo(
        () =>
            CSP_CASES.filter((c) => shapeFilter === "all" || c.topShape === shapeFilter || c.bottomShape === shapeFilter).filter(
                (c) => !learnedOnly || (progress?.[c.id] ?? false)
            ),
        [shapeFilter, learnedOnly, progress]
    );

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto py-10 px-4">
                <Link to="/training" className="text-sm text-foreground/45 hover:text-foreground mb-6 inline-block">
                    &larr; Back to training
                </Link>
                <div className="flex items-center justify-between gap-4 mb-2">
                    <h1 className="text-2xl font-semibold">Square-1 CSP Training</h1>
                    <div className="flex items-center gap-4">
                        <Link to="/training/square1-csp/sandbox" className="text-sm text-foreground/45 hover:text-foreground">
                            Sandbox &rarr;
                        </Link>
                        <Link to="/training/square1-csp/recall" className="text-sm text-foreground/45 hover:text-foreground">
                            Quiz &rarr;
                        </Link>
                    </div>
                </div>
                <p className="text-sm text-foreground/45 mb-6">
                    Check off cases you've learned - only those show up in the quiz. Edit an algorithm to save your own
                    version, or use the swap arrow to flip which one is labeled even/odd for that case.
                </p>
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-foreground/45">
                        {learnedCount} / {CSP_CASES.length} learned
                    </span>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-sm text-foreground/45 hover:text-foreground cursor-pointer">
                            <input
                                type="checkbox"
                                checked={learnedOnly}
                                onChange={(e) => setLearnedOnly(e.target.checked)}
                            />
                            Learned only
                        </label>
                        <select
                            value={shapeFilter}
                            onChange={(e) => setShapeFilter(e.target.value as Shape | "all")}
                            className="text-sm rounded-md border border-foreground/10 bg-background px-2 py-1.5"
                        >
                            <option value="all">All shapes</option>
                            {ALL_SHAPES.map((shape) => (
                                <option key={shape} value={shape}>
                                    {shape}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-[8rem_1fr_1fr] gap-3 text-xs font-mono text-foreground/45 uppercase tracking-wide pb-2 border-b border-foreground/10">
                    <div>Case</div>
                    <div>Algorithms</div>
                    <div>Notes</div>
                </div>
                <div className="pb-12">
                    {filteredCases.map((cspCase) => (
                        <CspCaseRow
                            key={cspCase.id}
                            cspCase={cspCase}
                            learned={progress?.[cspCase.id] ?? false}
                            customization={customizations?.[cspCase.id] ?? null}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SquareOneCsp;
