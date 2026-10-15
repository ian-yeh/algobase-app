import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { GripVertical } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { useAuthStore } from "@/stores/authStore";
import Loading from "@/components/Loading";
import { AlgThumb } from "@/features/alg-lists/AlgThumb";
import { AlgPlayer } from "@/features/alg-lists/AlgPlayer";
import { EntryForm, SingleForm } from "@/features/alg-lists/EntryForm";

type Status = Doc<"algEntries">["status"];
type Filter = "all" | "learning" | "learned" | "none";
const NEXT_STATUS: Record<string, Status> = { none: "learning", learning: "learned", learned: undefined };
const STATUS_LABEL = { learning: "Learning", learned: "Learned" };
const STATUS_CLASS = {
    learning: "border-amber-500/40 text-amber-500",
    learned: "border-emerald-500/40 text-emerald-500",
};

const button =
    "text-sm rounded-md border border-foreground/20 text-foreground/70 px-3 py-1.5 hover:bg-foreground/10 transition-colors";

// Owner view at /lists/:listId; `shared` is the public read-only view at /lists/share/:listId.
const AlgList = ({ shared = false }: { shared?: boolean }) => {
    const { listId = "" } = useParams();
    const token = useAuthStore((s) => s.token);
    const navigate = useNavigate();
    const owned = useQuery(api.algLists.getList, !shared && token ? { token, listId: listId as Id<"algLists"> } : "skip");
    const publicList = useQuery(api.algLists.getSharedList, shared ? { listId } : "skip");
    const data = shared ? publicList : owned;

    const updateList = useMutation(api.algLists.updateList);
    const deleteList = useMutation(api.algLists.deleteList);
    const deleteEntry = useMutation(api.algLists.deleteEntry);
    const moveEntry = useMutation(api.algLists.moveEntry);
    const setEntryStatus = useMutation(api.algLists.setEntryStatus);

    const [editing, setEditing] = useState<Doc<"algEntries"> | null>(null);
    const [playing, setPlaying] = useState<Doc<"algEntries"> | null>(null);
    const [dragId, setDragId] = useState<Id<"algEntries"> | null>(null);
    const [copied, setCopied] = useState(false);
    const [filter, setFilter] = useState<Filter>("all");

    if (data === undefined) return <Loading />;
    if (data === null) {
        return <p className="max-w-4xl mx-auto py-10 px-4 text-sm text-foreground/45">This list isn't shared or doesn't exist.</p>;
    }

    const { list, entries } = data;
    const canEdit = !shared && !!token;
    const count = (status: Status) => entries.filter((e) => e.status === status).length;
    const visible = filter === "all" ? entries : entries.filter((e) => (e.status ?? "none") === filter);

    const handleDrop = (target: Doc<"algEntries">) => {
        const from = entries.findIndex((e) => e._id === dragId);
        const to = entries.findIndex((e) => e._id === target._id);
        setDragId(null);
        if (!token || from === -1 || from === to) return;
        // Land on the target's side away from where the dragged entry came from.
        const neighbour = entries[from < to ? to + 1 : to - 1];
        const order = neighbour ? (target.order + neighbour.order) / 2 : target.order + (from < to ? 1 : -1);
        moveEntry({ token, entryId: entries[from]._id, order });
    };

    const handleDelete = async () => {
        if (!token || !confirm(`Delete "${list.name}" and its ${entries.length} algs?`)) return;
        await deleteList({ token, listId: list._id });
        navigate("/lists");
    };

    const shareUrl = `${window.location.origin}/lists/share/${list._id}`;

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto py-10 px-4">
                {canEdit && (
                    <Link to="/lists" className="text-sm text-foreground/45 hover:text-foreground mb-6 inline-block">
                        &larr; All lists
                    </Link>
                )}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    {canEdit ? (
                        <input
                            key={list.name}
                            defaultValue={list.name}
                            onBlur={(e) => e.target.value !== list.name && updateList({ token, listId: list._id, name: e.target.value })}
                            aria-label="List name"
                            className="flex-1 min-w-48 text-2xl font-semibold bg-transparent focus:outline-none"
                        />
                    ) : (
                        <h1 className="flex-1 text-2xl font-semibold">{list.name}</h1>
                    )}
                    {canEdit && list.puzzle === "3x3" && (
                        <select
                            value={list.topColor}
                            onChange={(e) => updateList({ token, listId: list._id, topColor: e.target.value as "white" | "yellow" })}
                            aria-label="Top color"
                            className="text-sm rounded-md border border-foreground/10 bg-background px-2 py-1.5"
                        >
                            <option value="yellow">Yellow top</option>
                            <option value="white">White top</option>
                        </select>
                    )}
                    {canEdit && (
                        <>
                            <label className="flex items-center gap-1.5 text-sm text-foreground/60 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={list.isShared}
                                    onChange={(e) => updateList({ token, listId: list._id, isShared: e.target.checked })}
                                />
                                Shared
                            </label>
                            {list.isShared && (
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(shareUrl);
                                        setCopied(true);
                                    }}
                                    className={button}
                                >
                                    {copied ? "Copied" : "Copy link"}
                                </button>
                            )}
                            <button onClick={handleDelete} className={`${button} hover:text-red-500`}>
                                Delete
                            </button>
                        </>
                    )}
                </div>

                {canEdit && (
                    <div className="mb-6">
                        <EntryForm
                            token={token}
                            listId={list._id}
                            puzzle={list.puzzle}
                            topColor={list.topColor}
                            entries={entries}
                        />
                    </div>
                )}

                {entries.length === 0 ? (
                    <p className="text-sm text-foreground/45">No algs yet.</p>
                ) : (
                    <div className="flex items-center gap-3 mb-2 text-sm text-foreground/45">
                        <span className="flex-1">
                            {count("learned")} learned, {count("learning")} learning of {entries.length}
                        </span>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as Filter)}
                            aria-label="Filter by status"
                            className="text-sm rounded-md border border-foreground/10 bg-background px-2 py-1"
                        >
                            <option value="all">All</option>
                            <option value="learning">Learning</option>
                            <option value="learned">Learned</option>
                            <option value="none">Not started</option>
                        </select>
                    </div>
                )}
                {entries.length > 0 && visible.length === 0 && <p className="text-sm text-foreground/45">No algs match this filter.</p>}
                <ul className="pb-12">
                    {visible.map((entry) =>
                        canEdit && editing?._id === entry._id ? (
                            <li key={entry._id} className="border-b border-foreground/10 py-3">
                                <SingleForm
                                    token={token}
                                    listId={list._id}
                                    puzzle={list.puzzle}
                                    topColor={list.topColor}
                                    editing={entry}
                                    onDoneEditing={() => setEditing(null)}
                                />
                            </li>
                        ) : (
                        <li
                            key={entry._id}
                            draggable={canEdit}
                            onDragStart={() => setDragId(entry._id)}
                            onDragOver={(e) => dragId && e.preventDefault()}
                            onDrop={() => handleDrop(entry)}
                            className={`flex items-start gap-3 border-b border-foreground/10 py-3 ${dragId === entry._id ? "opacity-40" : ""}`}
                        >
                            {canEdit && <GripVertical className="w-4 h-4 mt-1 shrink-0 text-foreground/30 cursor-grab" />}
                            <button onClick={() => setPlaying(entry)} aria-label={`Open ${entry.name || "Untitled"}`} className="shrink-0">
                                <AlgThumb puzzle={list.puzzle} alg={entry.alg} topColor={list.topColor} />
                            </button>
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setPlaying(entry)} className="font-medium text-left hover:text-accent">
                                        {entry.name || "Untitled"}
                                    </button>
                                    {canEdit ? (
                                        <button
                                            onClick={() =>
                                                setEntryStatus({ token, entryId: entry._id, status: NEXT_STATUS[entry.status ?? "none"] })
                                            }
                                            title="Click to change status"
                                            className={`text-xs rounded-full border px-2 py-0.5 ${
                                                entry.status
                                                    ? STATUS_CLASS[entry.status]
                                                    : "border-dashed border-foreground/20 text-foreground/35 hover:text-foreground/60"
                                            }`}
                                        >
                                            {entry.status ? STATUS_LABEL[entry.status] : "Set status"}
                                        </button>
                                    ) : (
                                        entry.status && (
                                            <span className={`text-xs rounded-full border px-2 py-0.5 ${STATUS_CLASS[entry.status]}`}>
                                                {STATUS_LABEL[entry.status]}
                                            </span>
                                        )
                                    )}
                                </div>
                                <div className="text-sm font-mono break-words">{entry.alg}</div>
                                {entry.notes && <div className="text-sm text-foreground/45 whitespace-pre-wrap">{entry.notes}</div>}
                            </div>
                            {canEdit && (
                                <div className="flex gap-2 text-xs shrink-0">
                                    <button onClick={() => setEditing(entry)} className="text-foreground/45 hover:text-foreground">
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteEntry({ token, entryId: entry._id })}
                                        className="text-foreground/45 hover:text-red-500"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </li>
                        )
                    )}
                </ul>
            </div>

            {playing && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={() => setPlaying(null)}
                >
                    <div
                        className="w-full max-w-xl rounded-lg border border-foreground/10 bg-background p-4 space-y-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{playing.name || "Untitled"}</span>
                            <button onClick={() => setPlaying(null)} className="text-sm text-foreground/45 hover:text-foreground">
                                Close
                            </button>
                        </div>
                        <AlgPlayer puzzle={list.puzzle} alg={playing.alg} topColor={list.topColor} />
                        {playing.notes && <p className="text-sm text-foreground/45 whitespace-pre-wrap">{playing.notes}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlgList;
