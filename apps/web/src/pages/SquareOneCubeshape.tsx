import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuthStore } from "@/stores/authStore";
import {
  CSP_CASES,
  flipCspShape,
  generateCspScramble,
  shapeLayerKinds,
  type CspScramble,
  type MiddleLayer,
  type Shape,
} from "@algobase/square-one";
import SquareOne from "@/features/square-one";
import { ShapePairIcon } from "@/features/square-one/ShapeIcon";

const ALL_IDS = CSP_CASES.map((c) => c.id);
const CASE_BY_ID = new Map(CSP_CASES.map((c) => [c.id, c]));
const ALL_SHAPES: Shape[] = Array.from(new Set(CSP_CASES.flatMap((c) => [c.topShape, c.bottomShape]))).sort();

const cornerCount = (shape: Shape) => shapeLayerKinds(shape).filter((k) => k === "corner").length / 2;
// 4/4-corner cases first, then 5/3 (edge pairs), then 6/2 (star).
const SORTED_CASES = [...CSP_CASES].sort(
  (a, b) => Math.max(cornerCount(a.topShape), cornerCount(a.bottomShape)) - Math.max(cornerCount(b.topShape), cornerCount(b.bottomShape))
);

const MIDDLE_LABELS: Record<MiddleLayer, string> = { random: "Random", solved: "Never flipped", flipped: "Always flipped" };

const ActionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, ...props }) => (
  <button
    {...props}
    className={`text-xs rounded-md border border-foreground/10 text-foreground/70 px-2.5 py-1.5 hover:border-foreground/25 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${className ?? ""}`}
  />
);

const SquareOneCubeshape = () => {
  const token = useAuthStore((s) => s.token);
  const me = useQuery(api.user.getMe, token ? { token } : "skip");
  const saveSettings = useMutation(api.user.setCubeshapeSettings);

  // Local copies so toggles feel instant; the query only seeds them.
  const [selectedOverride, setSelectedOverride] = useState<string[] | null>(null);
  const [middleOverride, setMiddleOverride] = useState<MiddleLayer | null>(null);
  const selected = selectedOverride ?? me?.cubeshapeCases ?? ALL_IDS;
  const middle = middleOverride ?? me?.cubeshapeMiddle ?? "random";
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const [current, setCurrent] = useState<CspScramble | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shapeFilter, setShapeFilter] = useState<Shape | "all">("all");

  const show = (next: CspScramble) => {
    setCurrent(next);
    setRevealed(false);
  };

  const newScramble = useCallback(
    (caseIds = selected) => {
      if (caseIds.length) show(generateCspScramble({ caseIds, middle }));
    },
    [selected, middle]
  );

  useEffect(() => {
    if (!current && me !== undefined) newScramble();
  }, [current, me, newScramble]);

  const setSelected = (next: string[]) => {
    setSelectedOverride(next);
    if (token) saveSettings({ token, cases: next });
  };

  const setMiddle = (next: MiddleLayer) => {
    setMiddleOverride(next);
    if (token) saveSettings({ token, middle: next });
  };

  const toggleCase = (id: string) =>
    setSelected(selectedSet.has(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  const deselectCurrent = () => {
    if (!current) return;
    const next = selected.filter((id) => id !== current.caseId);
    setSelected(next);
    newScramble(next);
  };

  const shownCases = SORTED_CASES.filter(
    (c) => shapeFilter === "all" || c.topShape === shapeFilter || c.bottomShape === shapeFilter
  );
  const setShown = (on: boolean) => {
    const shownIds = new Set(shownCases.map((c) => c.id));
    setSelected(on ? [...new Set([...selected, ...shownIds])] : selected.filter((id) => !shownIds.has(id)));
  };

  const copyScramble = async () => {
    if (!current) return;
    await navigator.clipboard.writeText(current.scramble);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const currentCase = current ? CASE_BY_ID.get(current.caseId) : undefined;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <Link to="/training" className="text-sm text-foreground/45 hover:text-foreground mb-6 inline-block">
          &larr; Back to training
        </Link>
        <h1 className="text-2xl font-semibold mb-2">Square-1 Cubeshape Trainer</h1>
        <p className="text-sm text-foreground/45 mb-6">
          Random-state scrambles that land on the shapes you pick below, with random parity.
        </p>

        <div className="flex items-center gap-2 mb-3 min-h-6 text-xs font-mono">
          {current ? (
            <>
              <span className="text-foreground/70 break-all">{current.scramble}</span>
              <button
                onClick={copyScramble}
                className="shrink-0 rounded border border-foreground/20 text-foreground/70 px-1.5 py-0.5 hover:bg-foreground/10 transition-colors"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </>
          ) : (
            selected.length === 0 && <span className="text-foreground/45">Select at least one case below.</span>
          )}
        </div>

        <SquareOne
          scramble={current?.scramble ?? ""}
          onScramble={() => newScramble()}
          className="h-[32rem] w-full rounded-xl overflow-hidden relative border border-foreground/10"
        />

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <ActionButton
            onClick={() => newScramble()}
            disabled={!selected.length}
            className="bg-foreground text-background! border-foreground hover:opacity-85"
          >
            New scramble
          </ActionButton>
          <ActionButton
            onClick={() => current && show(generateCspScramble({ caseIds: [current.caseId], middle }))}
            disabled={!current}
          >
            Repeat case
          </ActionButton>
          <ActionButton
            onClick={() => current && show(generateCspScramble({ shape: current.shape, parity: current.parity, middle }))}
            disabled={!current}
          >
            Same parity
          </ActionButton>
          <ActionButton
            onClick={() =>
              current && show(generateCspScramble({ shape: current.shape, parity: 1 - current.parity, middle }))
            }
            disabled={!current}
          >
            Opposite parity
          </ActionButton>
          <ActionButton
            onClick={() => current && show(generateCspScramble({ shape: flipCspShape(current.shape), middle }))}
            disabled={!current}
          >
            Flip top/bottom
          </ActionButton>
          <ActionButton onClick={deselectCurrent} disabled={!current || !selectedSet.has(current.caseId)}>
            Deselect case
          </ActionButton>
          <ActionButton onClick={() => setRevealed((r) => !r)} disabled={!current}>
            {revealed ? "Hide case" : "Show case"}
          </ActionButton>
          {revealed && currentCase && (
            <span className="text-sm text-foreground/70">
              {currentCase.topShape} / {currentCase.bottomShape}
            </span>
          )}
        </div>

        <label className="flex items-center gap-2 mt-4 text-sm text-foreground/45">
          Middle layer
          <select
            value={middle}
            onChange={(e) => setMiddle(e.target.value as MiddleLayer)}
            className="text-sm rounded-md border border-foreground/10 bg-background px-2 py-1.5 text-foreground"
          >
            {(Object.keys(MIDDLE_LABELS) as MiddleLayer[]).map((m) => (
              <option key={m} value={m}>
                {MIDDLE_LABELS[m]}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-10 mb-3">
          <h2 className="font-medium">
            Cases <span className="text-sm font-normal text-foreground/45">{selected.length} / {CSP_CASES.length}</span>
          </h2>
          <div className="flex items-center gap-3">
            <button onClick={() => setShown(true)} className="text-sm text-foreground/45 hover:text-foreground">
              Select {shapeFilter === "all" ? "all" : "shown"}
            </button>
            <button onClick={() => setShown(false)} className="text-sm text-foreground/45 hover:text-foreground">
              {shapeFilter === "all" ? "Select none" : "Deselect shown"}
            </button>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-12">
          {shownCases.map((c) => {
            const on = selectedSet.has(c.id);
            return (
              <label
                key={c.id}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                  on ? "border-foreground/30 bg-foreground/5" : "border-foreground/10 hover:border-foreground/25"
                }`}
              >
                <input type="checkbox" checked={on} onChange={() => toggleCase(c.id)} />
                <ShapePairIcon top={c.topShape} bottom={c.bottomShape} className="h-9 shrink-0" />
                <span className="text-xs leading-tight">
                  {c.topShape}
                  <br />
                  {c.bottomShape}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SquareOneCubeshape;
