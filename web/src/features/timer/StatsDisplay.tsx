import React from 'react';

interface StatsDisplayProps {
    stats: {
        best_ao5: number;
        best_ao12: number;
        best_ao100: number;
        best_time: number;
        total_solves: number;
    } | null;
    runningAO5?: number | null;
    runningAO12?: number | null;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats, runningAO5, runningAO12 }) => {
    if (!stats) return null;

    const formatTime = (seconds: number | null | undefined) => {
        if (seconds === null || seconds === undefined || seconds === 0 || seconds === Infinity) return '--';
        const ms = seconds * 1000;
        const s = Math.floor(ms / 1000);
        const m = Math.floor((ms % 1000) / 10);
        return `${s}.${m.toString().padStart(2, '0')}`;
    };

    return (
        <div className="py-8 w-full max-w-lg mx-auto text-sm text-foreground/60 font-sans tracking-wide space-y-1">
            <div className="flex justify-center space-x-8 uppercase font-bold">
                <span>ao5: {formatTime(runningAO5)}</span>
                <span>ao12: {formatTime(runningAO12)}</span>
                <span>best: {formatTime(stats.best_time)}</span>
                <span>solves: {stats.total_solves}</span>
            </div>
        </div>
    );
};

export default StatsDisplay;
