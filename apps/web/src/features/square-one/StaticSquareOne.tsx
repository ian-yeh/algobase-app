import { useEffect, useRef, useState } from "react";
import { renderStaticSquare1 } from "@algobase/square-one";

// A single non-animated, non-interactive frame of a posed Square-1. `sequence` must be
// in engine convention (e.g. from getReferenceSetup) - see renderStaticSquare1.
// Defers the actual WebGL render until scrolled near view, since a grid can have dozens
// of these mounted at once.
export const StaticSquareOne: React.FC<{ sequence: string; className?: string }> = ({
  sequence,
  className = "h-40 w-full",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const container = containerRef.current;
    if (!container) return;
    return renderStaticSquare1(container, sequence);
  }, [inView, sequence]);

  return <div ref={containerRef} className={className} />;
};

export default StaticSquareOne;
