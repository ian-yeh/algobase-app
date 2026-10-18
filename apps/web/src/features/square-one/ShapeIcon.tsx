import { shapeLayerKinds, type Shape } from "@algobase/square-one";

// Real Square-1 piece geometry in cube shape: edge outer points sit on the square's side (1 / cos 15deg from the center), corner tips on its corners (sqrt 2). Cell k starts at k*30deg + 15deg so the Square shape draws axis-aligned.
const EDGE_R = 1 / Math.cos(Math.PI / 12);
const TIP_R = Math.SQRT2;

function point(cell: number, r: number): string {
  const a = ((cell * 30 + 15 - 90) * Math.PI) / 180;
  return `${(r * Math.cos(a)).toFixed(3)},${(r * Math.sin(a)).toFixed(3)}`;
}

const Layer: React.FC<{ shape: Shape }> = ({ shape }) => {
  const kinds = shapeLayerKinds(shape);
  const pieces: { corner: boolean; points: string }[] = [];
  for (let i = 0; i < 12; i += kinds[i] === "corner" ? 2 : 1) {
    pieces.push(
      kinds[i] === "corner"
        ? { corner: true, points: `0,0 ${point(i, EDGE_R)} ${point(i + 1, TIP_R)} ${point(i + 2, EDGE_R)}` }
        : { corner: false, points: `0,0 ${point(i, EDGE_R)} ${point(i + 1, EDGE_R)}` }
    );
  }
  return (
    <svg viewBox="-1.5 -1.5 3 3" className="h-full aspect-square">
      {pieces.map((p, i) => (
        <polygon
          key={i}
          points={p.points}
          className={p.corner ? "fill-foreground/55" : "fill-foreground/25"}
          stroke="var(--color-background)"
          strokeWidth={0.06}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
};

// Top and bottom layer shapes side by side, each as seen from its own outside.
export const ShapePairIcon: React.FC<{ top: Shape; bottom: Shape; className?: string }> = ({
  top,
  bottom,
  className = "h-10",
}) => (
  <div className={`flex gap-1 ${className}`}>
    <Layer shape={top} />
    <Layer shape={bottom} />
  </div>
);
