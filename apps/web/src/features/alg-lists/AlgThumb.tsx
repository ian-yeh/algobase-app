import { StaticCube } from "@/features/three-by-three/StaticCube";
import { StaticSquareOne } from "@/features/square-one/StaticSquareOne";
import { cubeCaseSetup, sq1CaseSetup, validateAlg, type Puzzle, type TopColor } from "@/lib/algList";

// The case an alg solves. Invalid text renders an empty box rather than throwing mid-render.
export const AlgThumb: React.FC<{ puzzle: Puzzle; alg: string; topColor: TopColor; className?: string }> = ({
  puzzle,
  alg,
  topColor,
  className = "h-24 w-24",
}) => {
  if (validateAlg(puzzle, alg)) return <div className={`${className} rounded bg-foreground/5`} />;
  return puzzle === "3x3" ? (
    <StaticCube sequence={cubeCaseSetup(alg, topColor)} className={className} />
  ) : (
    <StaticSquareOne sequence={sq1CaseSetup(alg)} className={className} />
  );
};

export default AlgThumb;
