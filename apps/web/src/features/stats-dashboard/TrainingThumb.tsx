import { CSP_CASES } from "@algobase/square-one";
import { StaticCube } from "@/features/three-by-three/StaticCube";
import { StaticSquareOne } from "@/features/square-one/StaticSquareOne";
import { sq1CaseSetup } from "@/lib/algList";

const CUBE_SCRAMBLE = "R U F' L2 D B' R2 U' F2 L D2";
const SQ1_SETUP = sq1CaseSetup(CSP_CASES.find((c) => c.id === "barrel-barrel")!.oddAlg!.sequence);

// Loaded via React.lazy so three.js stays off the dashboard's critical path.
const TrainingThumb = ({ puzzle, className }: { puzzle: "3x3" | "sq1"; className: string }) =>
    puzzle === "3x3" ? (
        <StaticCube sequence={CUBE_SCRAMBLE} className={className} />
    ) : (
        <StaticSquareOne sequence={SQ1_SETUP} className={className} />
    );

export default TrainingThumb;
