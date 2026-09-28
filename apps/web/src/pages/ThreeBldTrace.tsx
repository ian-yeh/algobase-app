import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Eraser, Undo2 } from "lucide-react";
import { generateScramble, invertAlg, opAlgForLetter, traceOldPochmann, useCubeScene, type PieceFocus, type PieceType } from "@algobase/three-by-three";

const noop = () => {};

const TURN_DURATION_MS = 30;

const normalize = (s: string) => s.replace(/[^a-zA-Z]/g, "").toUpperCase();

type TraceStatus = "empty" | "correct" | "incorrect";

function traceStatus(input: string, correct: string[]): TraceStatus {
  const norm = normalize(input);
  if (!norm) return "empty";
  return norm === correct.join("") ? "correct" : "incorrect";
}

const inputClass = (status: TraceStatus) =>
  `w-full rounded-lg border bg-background px-3 py-2.5 font-mono text-base tracking-widest uppercase outline-none transition-colors placeholder:normal-case placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:text-foreground/30 ${
    status === "correct"
      ? "border-green-500 text-green-600"
      : status === "incorrect"
        ? "border-red-500 text-red-600"
        : "border-line text-foreground focus:border-foreground/30"
  }`;

const STATUS_LABEL: Record<TraceStatus, string> = { empty: "", correct: "Correct", incorrect: "Incorrect" };

const TraceField: React.FC<{
  label: string;
  value: string;
  status: TraceStatus;
  onChange: (value: string) => void;
  onExecute: () => void;
}> = ({ label, value, status, onChange, onExecute }) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      onExecute();
    }}
  >
    <div className="flex items-baseline justify-between mb-1.5">
      <label htmlFor={label} className="text-sm font-medium text-foreground/80">{label}</label>
      <span className={`text-xs ${status === "correct" ? "text-green-600" : "text-red-600"}`}>
        {STATUS_LABEL[status]}
      </span>
    </div>
    <div className="flex gap-2">
      <input
        id={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type letters..."
        spellCheck={false}
        autoComplete="off"
        className={inputClass(status)}
      />
      <button
        type="submit"
        disabled={!normalize(value)}
        className="shrink-0 rounded-lg border border-accent/30 px-3 text-sm font-medium text-accent hover:bg-accent/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        Execute
      </button>
    </div>
  </form>
);

const FOCUS_OPTIONS: { value: PieceFocus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "edge", label: "Edges" },
  { value: "corner", label: "Corners" },
];

const iconButtonClass =
  "rounded-md p-1 text-foreground/45 hover:bg-foreground/10 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors";

const Section: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  action,
  children,
}) => (
  <section className="rounded-xl border border-line bg-background/70 p-4">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/40">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

const ThreeBldTrace = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { queueRef } = useCubeScene(containerRef, {
    autoRotate: false,
    initialSequence: "",
    onMoveStart: noop,
    onMoveComplete: noop,
    onQueueEmpty: noop,
  });
  const [lettersOn, setLettersOn] = useState(false);
  const [focus, setFocus] = useState<PieceFocus>("all");
  const [panelOpen, setPanelOpen] = useState(true);
  const [edgeInput, setEdgeInput] = useState("");
  const [cornerInput, setCornerInput] = useState("");
  const [executed, setExecuted] = useState<string[]>([]);

  // Executes setup + swap + undo-setup for each letter on the cube, like actually solving the memo.
  const runLetters = (input: string, type: PieceType) => {
    const sequence = [...normalize(input)].map((letter) => opAlgForLetter(letter, type) ?? "").join(" ").trim();
    if (!sequence) return;
    queueRef.current?.enqueueSequence(sequence, TURN_DURATION_MS);
    setExecuted((stack) => [...stack, sequence]);
  };

  // Undo plays the inverse of the most recent execution, so executions must be undone newest-first.
  const undo = () => {
    const last = executed.at(-1);
    if (!last) return;
    queueRef.current?.enqueueSequence(invertAlg(last), TURN_DURATION_MS);
    setExecuted((stack) => stack.slice(0, -1));
  };

  const scramble = () => {
    queueRef.current?.enqueueSequence(generateScramble(), TURN_DURATION_MS);
    setExecuted([]);
  };
  const reset = () => {
    queueRef.current?.resetState();
    setExecuted([]);
  };
  const changeFocus = (next: PieceFocus) => {
    setFocus(next);
    queueRef.current?.setFocus(next);
  };
  const toggleLetters = () => {
    const next = !lettersOn;
    setLettersOn(next);
    queueRef.current?.setLabelsVisible(next);
  };

  const memo = queueRef.current ? traceOldPochmann(queueRef.current.getState()) : null;
  const edgeStatus = memo ? traceStatus(edgeInput, memo.edges) : "empty";
  const cornerStatus = memo ? traceStatus(cornerInput, memo.corners) : "empty";

  return (
    <div className="relative h-full w-full">
      <Link
        to="/training"
        className="absolute top-4 left-4 text-sm text-foreground/45 hover:text-foreground transition-colors"
      >
        &larr; Back to Training
      </Link>
      <div ref={containerRef} className="h-full w-full" />
      <aside className="absolute top-4 right-4 w-[22rem] max-w-[calc(100%-2rem)] max-h-[calc(100%-2rem)] flex flex-col rounded-2xl border border-line bg-surface/90 backdrop-blur-md shadow-xl shadow-foreground/5">
        <button
          onClick={() => setPanelOpen((o) => !o)}
          aria-expanded={panelOpen}
          className="flex items-center justify-between px-5 py-4 text-left"
        >
          <div>
            <div className="font-semibold tracking-tight">3BLD Tracing</div>
            <div className="text-xs text-foreground/45">Old Pochmann, Speffz lettering</div>
          </div>
          <ChevronDown
            size={18}
            className={`text-foreground/45 transition-transform ${panelOpen ? "rotate-180" : ""}`}
          />
        </button>
        {panelOpen && (
          <div className="flex flex-col gap-3 px-3 pb-3 overflow-y-auto">
            <Section
              title="Trace"
              action={
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEdgeInput("");
                      setCornerInput("");
                    }}
                    disabled={!edgeInput && !cornerInput}
                    aria-label="Clear traces"
                    title="Clear traces"
                    className={iconButtonClass}
                  >
                    <Eraser size={15} />
                  </button>
                  <button
                    onClick={undo}
                    disabled={executed.length === 0}
                    aria-label="Undo last execution"
                    title="Undo last execution"
                    className={iconButtonClass}
                  >
                    <Undo2 size={15} />
                  </button>
                </div>
              }
            >
              <div className="space-y-4">
                <TraceField
                  label="Edges"
                  value={edgeInput}
                  status={edgeStatus}
                  onChange={setEdgeInput}
                  onExecute={() => runLetters(edgeInput, "edge")}
                />
                <TraceField
                  label="Corners"
                  value={cornerInput}
                  status={cornerStatus}
                  onChange={setCornerInput}
                  onExecute={() => runLetters(cornerInput, "corner")}
                />
              </div>
            </Section>
            <Section title="Cube">
              <div className="flex gap-2">
                <button
                  onClick={scramble}
                  className="flex-1 rounded-lg bg-foreground text-background py-2 text-sm font-medium hover:opacity-85 transition-opacity"
                >
                  Scramble
                </button>
                <button
                  onClick={reset}
                  className="flex-1 rounded-lg border border-line bg-background py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:border-foreground/25 transition-colors"
                >
                  Reset
                </button>
              </div>
            </Section>
            <Section title="Display">
              <div className="flex items-center justify-between text-sm text-foreground/80 mb-4">
                Pieces
                <div role="radiogroup" className="flex rounded-lg border border-line bg-background p-0.5">
                  {FOCUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      role="radio"
                      aria-checked={focus === option.value}
                      onClick={() => changeFocus(option.value)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        focus === option.value
                          ? "bg-foreground text-background"
                          : "text-foreground/55 hover:text-foreground"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center justify-between text-sm text-foreground/80">
                Sticker letters
                <button
                  role="switch"
                  aria-checked={lettersOn}
                  onClick={toggleLetters}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    lettersOn ? "bg-accent" : "bg-foreground/20"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      lettersOn ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </label>
            </Section>
          </div>
        )}
      </aside>
    </div>
  );
};

export default ThreeBldTrace;
