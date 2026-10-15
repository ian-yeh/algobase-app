import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuthStore } from "@/stores/authStore";
import type { Puzzle } from "@/lib/algList";

const PUZZLE_LABEL: Record<Puzzle, string> = { "3x3": "3x3", sq1: "Square-1" };

const AlgLists = () => {
    const token = useAuthStore((s) => s.token);
    const navigate = useNavigate();
    const lists = useQuery(api.algLists.getLists, token ? { token } : "skip");
    const createList = useMutation(api.algLists.createList);
    const [name, setName] = useState("");
    const [puzzle, setPuzzle] = useState<Puzzle>("3x3");

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        const listId = await createList({ token, name, puzzle });
        navigate(`/lists/${listId}`);
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto py-10 px-4">
                <h1 className="text-2xl font-semibold mb-6">Lists</h1>
                <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-2 mb-8">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="New list name"
                        className="flex-1 min-w-48 text-sm rounded-md border border-foreground/10 bg-background px-3 py-2 focus:outline-none focus:border-foreground/25"
                    />
                    <select
                        value={puzzle}
                        onChange={(e) => setPuzzle(e.target.value as Puzzle)}
                        className="text-sm rounded-md border border-foreground/10 bg-background px-2 py-2"
                    >
                        <option value="3x3">3x3</option>
                        <option value="sq1">Square-1</option>
                    </select>
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="text-sm rounded-md border border-accent/30 text-accent px-3 py-2 hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Create
                    </button>
                </form>
                {lists?.length === 0 && <p className="text-sm text-foreground/45">No lists yet.</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lists?.map((list) => (
                        <Link
                            key={list._id}
                            to={`/lists/${list._id}`}
                            className="block rounded-lg border border-foreground/10 p-4 hover:border-foreground/25 hover:bg-foreground/3 transition-colors"
                        >
                            <div className="font-medium">{list.name}</div>
                            <div className="text-sm text-foreground/45">
                                {PUZZLE_LABEL[list.puzzle]}
                                {list.isShared ? " - shared" : ""}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AlgLists;
