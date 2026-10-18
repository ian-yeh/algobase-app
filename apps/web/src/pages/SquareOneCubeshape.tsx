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
  type CspCase,
  type CspScramble,
  type MiddleLayer,
  type Shape,
} from "@algobase/square-one";
import SquareOne from "@/features/square-one";
import { ShapePairIcon } from "@/features/square-one/ShapeIcon";

const ALL_IDS = CSP_CASES.map((c) => c.id);
const CASE_BY_ID = new Map(CSP_CASES.map((c) => [c.id, c]));

const cornerCount = (shape: Shape) => shapeLayerKinds(shape).filter((k) => k === "corner").length / 2;
const cornerSplit = (c: CspCase) => Math.max(cornerCount(c.topShape), cornerCount(c.bottomShape));
// Grouped by how the 8 corners split between layers: 4/4 first, then 5/3, 6/2, ...
const CASE_GROUPS = [...new Set(CSP_CASES.map(cornerSplit))]
  .sort((a, b) => a - b)
  .map((split) => ({ split, cases: CSP_CASES.filter((c) => cornerSplit(c) === split) }));

const MIDDLE_OPTIONS: { value: MiddleLayer; label: string }[] = [
  { value: "random", label: "Random" },
  { value: "solved", label: "Always square" },
  { value: "flipped", label: "Always flipped" },
];

const DrillButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
  <button
    {...props}
    className="text-sm rounded-md border border-foreground/10 text-foreground/70 px-3 py-1.5 hover:border-foreground/25 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

  const [history, setHistory] = useState<{ list: CspScramble[]; i: number }>({ list: [], i: -1 });
  const current = history.list[history.i] ?? null;
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const show = (next: CspScramble) => {
    setHistory((h) => ({ list: [...h.list.slice(0, h.i + 1), next], i: h.i + 1 }));
    setRevealed(false);
  };

  const step = (by: number) => {
    setHistory((h) => ({ ...h, i: h.i + by }));
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

  const setGroup = (cases: CspCase[], on: boolean) => {
    const ids = new Set(cases.map((c) => c.id));
    setSelected(on ? [...new Set([...selected, ...ids])] : selected.filter((id) => !ids.has(id)));
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
      <div className="max-w-3xl mx-auto py-10 px-4 pb-16">
        <Link to="/training" className="text-sm text-foreground/45 hover:text-foreground mb-6 inline-block">
          &larr; Back to training
        </Link>
        <h1 className="text-2xl font-semibold mb-2">Square-1 Cubeshape</h1>
        <p className="text-sm text-foreground/55 mb-8">
          Choose which cases appear under <a href="#cases" className="underline underline-offset-2 hover:text-foreground">Cases</a>.
        </p>

        {selected.length === 0 ? (
          <div className="rounded-xl border border-dashed border-foreground/20 px-6 py-12 text-center mb-10">
            <p className="font-medium mb-1">No cases selected</p>
            <p className="text-sm text-foreground/55 mb-4">Choose at least one case to get scrambles.</p>
            <button
              onClick={() => setSelected(ALL_IDS)}
              className="text-sm font-medium rounded-md bg-foreground text-background px-4 py-2 hover:opacity-85 transition-opacity"
            >
              Select all cases
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-t-xl border border-b-0 border-foreground/10 bg-surface px-5 py-5 sm:px-6">
              <p className="font-mono text-xl sm:text-2xl leading-relaxed break-words min-h-9">{current?.scramble}</p>
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <button
                  onClick={() => step(-1)}
                  disabled={history.i <= 0}
                  className="text-sm rounded-md border border-foreground/15 text-foreground/70 px-4 py-2 hover:text-foreground hover:border-foreground/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  &larr; Previous
                </button>
                <button
                  onClick={() => (history.i < history.list.length - 1 ? step(1) : newScramble())}
                  className="text-sm font-medium rounded-md bg-foreground text-background px-5 py-2 hover:opacity-85 transition-opacity"
                >
                  Next &rarr;
                </button>
                <span className="text-sm text-foreground/45 ml-2">
                  From {selected.length} of {CSP_CASES.length} cases
                </span>
                <button
                  onClick={copyScramble}
                  disabled={!current}
                  className="ml-auto text-sm text-foreground/55 hover:text-foreground transition-colors"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <SquareOne
              scramble={current?.scramble ?? ""}
              animated={false}
              className="h-[26rem] w-full rounded-b-xl overflow-hidden relative border border-foreground/10"
            />

            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mt-4">
              <span className="text-sm text-foreground/45">Drill again</span>
              <div className="flex flex-wrap gap-2">
                <DrillButton
                  onClick={() => current && show(generateCspScramble({ caseIds: [current.caseId], middle }))}
                  disabled={!current}
                  title="Same shapes, either parity"
                >
                  Same case
                </DrillButton>
                <DrillButton
                  onClick={() => current && show(generateCspScramble({ shape: current.shape, parity: current.parity, middle }))}
                  disabled={!current}
                  title="Same shapes and the same parity"
                >
                  Same parity
                </DrillButton>
                <DrillButton
                  onClick={() =>
                    current && show(generateCspScramble({ shape: current.shape, parity: 1 - current.parity, middle }))
                  }
                  disabled={!current}
                  title="Same shapes, the other parity"
                >
                  Other parity
                </DrillButton>
                <DrillButton
                  onClick={() => current && show(generateCspScramble({ shape: flipCspShape(current.shape), middle }))}
                  disabled={!current}
                  title="Same shapes with top and bottom swapped"
                >
                  Upside down
                </DrillButton>
              </div>
              <button
                onClick={() => setRevealed((r) => !r)}
                disabled={!current}
                className="sm:ml-auto flex items-center gap-2 text-sm text-foreground/45 hover:text-foreground transition-colors"
              >
                {revealed && currentCase ? (
                  <>
                    <ShapePairIcon top={currentCase.topShape} bottom={currentCase.bottomShape} className="h-6" />
                    <span className="text-foreground/70">
                      {currentCase.topShape} / {currentCase.bottomShape}
                    </span>
                  </>
                ) : (
                  "Show case name"
                )}
              </button>
            </div>
          </>
        )}

        <section className="mt-12">
          <div className="mb-10">
            <div className="text-sm mb-2">Middle layer</div>
            <div role="radiogroup" className="inline-flex rounded-lg border border-foreground/10 p-0.5">
              {MIDDLE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  role="radio"
                  aria-checked={middle === o.value}
                  onClick={() => setMiddle(o.value)}
                  className={`text-sm rounded-md px-3 py-1.5 transition-colors ${
                    middle === o.value ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div id="cases" className="flex items-end justify-between gap-4 mb-3 scroll-mt-6">
            <div>
              <h2 className="font-medium">
                Cases <span className="font-normal text-foreground/45">{selected.length} / {CSP_CASES.length}</span>
              </h2>
              <p className="text-sm text-foreground/55">Scrambles only use the checked cases.</p>
            </div>
            <div className="flex gap-3 text-sm text-foreground/45">
              <button onClick={() => setSelected(ALL_IDS)} className="hover:text-foreground">
                Select all
              </button>
              <button onClick={() => setSelected([])} className="hover:text-foreground">
                Clear
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-foreground/10 divide-y divide-foreground/10">
            {CASE_GROUPS.map(({ split, cases }) => {
              const count = cases.filter((c) => selectedSet.has(c.id)).length;
              return (
                <details key={split} className="group">
                  <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none list-none hover:bg-foreground/[0.03]">
                    <span className="text-foreground/35 transition-transform group-open:rotate-90">&rsaquo;</span>
                    <span className="text-sm font-medium">
                      {split} + {8 - split} corners
                    </span>
                    <span className="text-sm text-foreground/45">
                      {count} / {cases.length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setGroup(cases, count < cases.length);
                      }}
                      className="ml-auto text-xs text-foreground/45 hover:text-foreground"
                    >
                      {count < cases.length ? "Select all" : "Clear"}
                    </button>
                  </summary>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-4 pb-4">
                    {cases.map((c) => {
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
                </details>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SquareOneCubeshape;
