import React from 'react';

export interface Solve {
    id: string;
    time: number;
    scramble: string;
    timestamp: number;
}

interface SolveHistoryProps {
    solves: Solve[];
    onDeleteSolve: (id: string) => void;
}

const SolveHistory: React.FC<SolveHistoryProps> = ({ solves, onDeleteSolve }) => {
    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10);
        return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full max-w-md mx-auto mt-8 border-t border-foreground/5 pt-8">
            <h3 className="text-foreground/40 text-xs font-bold uppercase tracking-widest mb-4 px-4">
                Recent Solves
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto px-2 custom-scrollbar">
                {solves.length === 0 ? (
                    <div className="text-center py-8 text-foreground/20 text-sm">
                        No solves yet.
                    </div>
                ) : (
                    solves.map((solve) => (
                        <div
                            key={solve.id}
                            className="flex items-center justify-between p-4 rounded-xl hover:bg-foreground/5 transition-colors group"
                        >
                            <div className="flex flex-col">
                                <span className="text-xl font-mono tabular-nums leading-tight">
                                    {formatTime(solve.time)}
                                </span>
                                <span className="text-[10px] text-foreground/30 truncate max-w-[200px]">
                                    {solve.scramble}
                                </span>
                            </div>
                            <button
                                onClick={() => onDeleteSolve(solve.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-foreground/20 hover:text-red-500 transition-all active:scale-90"
                                title="Delete solve"
                            >
                                ✕
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SolveHistory;
