import React, { useEffect } from 'react';
import type { Solve } from './SolveHistory';

interface SolveDetailModalProps {
    solve: Solve | null;
    onClose: () => void;
    onDelete: (id: string) => void;
}

const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
};

const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const SolveDetailModal: React.FC<SolveDetailModalProps> = ({ solve, onClose, onDelete }) => {
    useEffect(() => {
        if (!solve) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [solve, onClose]);

    if (!solve) return null;

    const handleDelete = () => {
        onDelete(solve.id);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm font-sans"
            onClick={onClose}
        >
            <div
                className="bg-background rounded-2xl shadow-2xl border border-foreground/5 max-w-md w-full mx-4 p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2">
                    Solve
                </div>
                <div className="text-6xl tabular-nums mb-8 text-black">
                    {formatTime(solve.time)}
                </div>
                <div className="space-y-5">
                    <div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-foreground/40 mb-1.5">
                            Scramble
                        </div>
                        <div className="text-sm leading-relaxed text-foreground/80 break-words">
                            {solve.scramble}
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-foreground/40 mb-1.5">
                            Date
                        </div>
                        <div className="text-sm text-foreground/80">
                            {formatTimestamp(solve.timestamp)}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-8 pt-6 border-t border-foreground/5">
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Delete
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SolveDetailModal;
