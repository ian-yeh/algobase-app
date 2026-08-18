import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import ImportModal from './ImportModal';

export interface Solve {
    id: string;
    time: number;
    scramble: string;
    timestamp: number;
}

interface SolveHistoryProps {
    solves: Solve[];
    onSelectSolve: (solve: Solve) => void;
    onDeleteSolve: (id: string) => void;
}

const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
};

const SolveHistory: React.FC<SolveHistoryProps> = ({ solves, onSelectSolve, onDeleteSolve }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);

    return (
        <div className="h-full flex flex-col bg-background">
            <div className="px-6 py-6 border-b border-foreground/5">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h3 className="text-black text-sm font-bold font-sans uppercase tracking-widest">
                            Recent Solves
                        </h3>
                        <p className="text-xs text-foreground/40 mt-1 font-sans">
                            {solves.length} {solves.length === 1 ? 'solve' : 'solves'}
                        </p>
                    </div>
                    <div className="relative" onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) setMenuOpen(false);
                    }}>
                        <button
                            type="button"
                            onClick={() => setMenuOpen((o) => !o)}
                            title="More options"
                            aria-label="More options"
                            className="p-1 text-foreground/30 hover:text-foreground transition-colors"
                        >
                            <MoreHorizontal size={18} />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 mt-1 z-10 w-52 rounded-md border border-foreground/10 bg-background shadow-lg py-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        setImportOpen(true);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-sans text-black hover:bg-foreground/5"
                                >
                                    Import solves from csTimer
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar font-sans text-black">
                {solves.length === 0 ? (
                    <div className="text-center py-12 text-foreground/20 text-sm">
                        No solves yet.
                    </div>
                ) : (
                    <ul className="divide-y divide-foreground/5">
                        {solves.map((solve, i) => (
                            <li key={solve.id}>
                                <button
                                    type="button"
                                    onClick={() => onSelectSolve(solve)}
                                    className="w-full text-left px-6 py-4 hover:bg-foreground/5 transition-colors group flex items-start gap-3"
                                >
                                    <span className="text-xs font-bold text-foreground/30 tabular-nums w-6 pt-2 shrink-0">
                                        {solves.length - i}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-2xl tabular-nums leading-tight">
                                                {formatTime(solve.time)}
                                            </span>
                                            <span
                                                role="button"
                                                tabIndex={0}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteSolve(solve.id);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        onDeleteSolve(solve.id);
                                                    }
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-foreground/20 hover:text-red-500 transition-all active:scale-90 cursor-pointer"
                                                title="Delete solve"
                                            >
                                                ✕
                                            </span>
                                        </div>
                                        <span className="text-xs text-foreground/40 leading-snug block break-words mt-1">
                                            {solve.scramble}
                                        </span>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
        </div>
    );
};

export default SolveHistory;
