import { useEffect, useRef } from "react";
import { renderStaticCube } from "@algobase/three-by-three";

// A single non-animated, non-interactive frame of a posed cube - see renderStaticCube.
export const StaticCube: React.FC<{ sequence?: string; className?: string }> = ({
  sequence = "",
  className = "h-40 w-full",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    return renderStaticCube(container, sequence);
  }, [sequence]);

  return <div ref={containerRef} className={className} />;
};

export default StaticCube;
