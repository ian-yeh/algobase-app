import React from 'react';
import { formatSecondsTime } from './timer.utils';

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

    return (
        <div className="py-8 w-full max-w-2xl mx-auto text-base sm:text-xl text-foreground/60 font-sans tracking-wide space-y-1">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 sm:gap-x-10 uppercase font-bold">
                <span>ao5: {formatSecondsTime(runningAO5)}</span>
                <span>ao12: {formatSecondsTime(runningAO12)}</span>
                <span>best: {formatSecondsTime(stats.best_time)}</span>
                <span>solves: {stats.total_solves}</span>
            </div>
        </div>
    );
};

export default StatsDisplay;
