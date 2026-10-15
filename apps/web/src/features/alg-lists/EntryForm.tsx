import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { parseBulk, validateAlg, type Puzzle, type TopColor } from "@/lib/algList";
import { AlgThumb } from "./AlgThumb";

const input =
  "w-full text-sm rounded-md border border-foreground/10 bg-background px-3 py-2 focus:outline-none focus:border-foreground/25";
const button =
  "text-sm rounded-md border px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

interface Props {
  token: string;
  listId: Id<"algLists">;
  puzzle: Puzzle;
  topColor: TopColor;
  editing: Doc<"algEntries"> | null;
  onDoneEditing: () => void;
}

export const SingleForm = ({ token, listId, puzzle, topColor, editing, onDoneEditing }: Props) => {
  const addEntries = useMutation(api.algLists.addEntries);
  const updateEntry = useMutation(api.algLists.updateEntry);
  const [name, setName] = useState(editing?.name ?? "");
  const [alg, setAlg] = useState(editing?.alg ?? "");
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const error = alg.trim() ? validateAlg(puzzle, alg) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateEntry({ token, entryId: editing._id, name, alg, notes });
      onDoneEditing();
    } else {
      await addEntries({ token, listId, entries: [{ name, alg, notes }] });
      setName("");
      setAlg("");
      setNotes("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      <AlgThumb puzzle={puzzle} alg={alg} topColor={topColor} className="h-28 w-28 shrink-0" />
      <div className="flex-1 space-y-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" className={input} />
        <input
          value={alg}
          onChange={(e) => setAlg(e.target.value)}
          placeholder={puzzle === "3x3" ? "R U R' U' ..." : "(1,0)/ (-3,0)/ ..."}
          className={`${input} font-mono`}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
          className={`${input} resize-none`}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!alg.trim() || !!error}
            className={`${button} border-accent/30 text-accent hover:bg-accent/10`}
          >
            {editing ? "Save" : "Add"}
          </button>
          {editing && (
            <button type="button" onClick={onDoneEditing} className={`${button} border-foreground/20 text-foreground/70 hover:bg-foreground/10`}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

// One entry per line; Import adds the valid lines and leaves the bad ones in the box.
const BulkForm = ({ token, listId, puzzle }: Props) => {
  const addEntries = useMutation(api.algLists.addEntries);
  const [text, setText] = useState("");
  const rows = parseBulk(text).map((row) => ({ ...row, error: validateAlg(puzzle, row.alg) }));
  const valid = rows.filter((r) => !r.error);

  const handleImport = async () => {
    await addEntries({ token, listId, entries: valid.map(({ name, alg }) => ({ name, alg, notes: "" })) });
    setText(rows.filter((r) => r.error).map((r) => r.line).join("\n"));
  };

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"One per line - \"name: alg\" or just the alg\nT-Perm: R U R' U' R' F R2 U' R' U' R U R' F'"}
        rows={6}
        className={`${input} font-mono resize-y`}
      />
      {rows.length > 0 && (
        <ul className="text-xs font-mono space-y-0.5">
          {rows.map((row, i) => (
            <li key={i} className={row.error ? "text-red-500" : "text-foreground/60"}>
              {row.error ? "x" : "+"} {row.name ? `${row.name}: ` : ""}
              {row.alg}
              {row.error ? ` - ${row.error}` : ""}
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={handleImport}
        disabled={!valid.length}
        className={`${button} border-accent/30 text-accent hover:bg-accent/10`}
      >
        Import {valid.length || ""}
      </button>
    </div>
  );
};

const toLine = (e: Doc<"algEntries">) => (e.name ? `${e.name}: ${e.alg}` : e.alg);

// The whole list as editable text. Saving makes the list match the text exactly - see replaceEntries.
const BulkEditForm = ({ token, listId, puzzle, entries }: Props & { entries: Doc<"algEntries">[] }) => {
  const replaceEntries = useMutation(api.algLists.replaceEntries);
  const original = entries.map(toLine).join("\n");
  const [text, setText] = useState(original);
  // The text the user started from. Follow live list changes until they start typing.
  const [base, setBase] = useState(original);
  if (base !== original && text === base) {
    setBase(original);
    setText(original);
  }
  const stale = base !== original;
  const rows = parseBulk(text).map((row) => ({ ...row, error: validateAlg(puzzle, row.alg) }));
  const errors = rows.filter((r) => r.error);

  const handleSave = async () => {
    const removed = entries.length - rows.length;
    if (removed > 0 && !confirm(`This removes ${removed} alg${removed === 1 ? "" : "s"} and their notes. Save?`)) return;
    await replaceEntries({ token, listId, entries: rows.map(({ name, alg }) => ({ name, alg })) });
    // Saved text may differ cosmetically (spacing) from how the list re-renders, so resync to it.
    setBase(text);
  };

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={Math.min(20, Math.max(6, rows.length + 1))}
        className={`${input} font-mono resize-y`}
      />
      {errors.length > 0 && (
        <ul className="text-xs font-mono space-y-0.5 text-red-500">
          {errors.map((row, i) => (
            <li key={i}>
              x {row.line.trim()} - {row.error}
            </li>
          ))}
        </ul>
      )}
      {stale && (
        <p className="text-xs text-red-500">
          The list changed since you started editing - saving will overwrite those changes. Revert to reload it.
        </p>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={errors.length > 0 || text === original}
          className={`${button} border-accent/30 text-accent hover:bg-accent/10`}
        >
          Save
        </button>
        <button
          onClick={() => {
            setBase(original);
            setText(original);
          }}
          disabled={text === original}
          className={`${button} border-foreground/20 text-foreground/70 hover:bg-foreground/10`}
        >
          Revert
        </button>
      </div>
    </div>
  );
};

type Tab = "one" | "paste" | "edit";
const TABS: [Tab, string][] = [["one", "Add one"], ["paste", "Bulk paste"], ["edit", "Bulk edit"]];

export const EntryForm: React.FC<Omit<Props, "editing" | "onDoneEditing"> & { entries: Doc<"algEntries">[] }> = ({
  entries,
  ...formProps
}) => {
  const props: Props = { ...formProps, editing: null, onDoneEditing: () => {} };
  const [tab, setTab] = useState<Tab>("one");
  const tabClass = (active: boolean) =>
    `text-sm px-2 py-1 rounded transition-colors ${active ? "text-foreground bg-foreground/5" : "text-foreground/45 hover:text-foreground"}`;

  return (
    <div className="rounded-lg border border-foreground/10 p-4 space-y-3">
      <div className="flex gap-1">
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={tabClass(tab === id)}>
            {label}
          </button>
        ))}
      </div>
      {tab === "one" && <SingleForm {...props} />}
      {tab === "paste" && <BulkForm {...props} />}
      {tab === "edit" && <BulkEditForm {...props} entries={entries} />}
    </div>
  );
};

export default EntryForm;
