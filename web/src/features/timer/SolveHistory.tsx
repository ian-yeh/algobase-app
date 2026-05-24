import React from 'react';

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
    return (
        <div className="h-full flex flex-col bg-background">
            <div className="px-6 py-6 border-b border-foreground/5">
                <h3 className="text-black text-xs font-bold font-sans uppercase tracking-widest">
                    Recent Solves
                </h3>
                <p className="text-[10px] text-foreground/40 mt-1 font-sans">
                    {solves.length} {solves.length === 1 ? 'solve' : 'solves'}
                </p>
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
                                    <span className="text-[10px] font-bold text-foreground/30 tabular-nums w-6 pt-1.5 shrink-0">
                                        {solves.length - i}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xl tabular-nums leading-tight">
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
                                        <span className="text-[10px] text-foreground/40 leading-snug block break-words mt-1">
                                            {solve.scramble}
                                        </span>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default SolveHistory;
