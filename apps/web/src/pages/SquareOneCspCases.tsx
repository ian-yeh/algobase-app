import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CSP_CASES, type Shape } from "@algobase/square-one";
import { CspCaseCard } from "@/components/square-one/CspCaseCard";

const ALL_SHAPES: Shape[] = Array.from(
    new Set(CSP_CASES.flatMap((c) => [c.topShape, c.bottomShape]))
).sort();

const SquareOneCspCases = () => {
    const [shapeFilter, setShapeFilter] = useState<Shape | "all">("all");

    const filteredCases = useMemo(
        () =>
            shapeFilter === "all"
                ? CSP_CASES
                : CSP_CASES.filter((c) => c.topShape === shapeFilter || c.bottomShape === shapeFilter),
        [shapeFilter]
    );

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-5xl mx-auto py-10 px-4">
                <Link to="/training/square1-csp" className="text-sm text-foreground/45 hover:text-foreground mb-6 inline-block">
                    &larr; Back to Square-1 CSP
                </Link>
                <div className="flex items-center justify-between gap-4 mb-6">
                    <h1 className="text-2xl font-semibold">All CSP Cases</h1>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-12">
                    {filteredCases.map((cspCase) => (
                        <CspCaseCard key={cspCase.id} cspCase={cspCase} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SquareOneCspCases;
