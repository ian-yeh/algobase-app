import React from 'react';

interface StatsDisplayProps {
    solves: number[];
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ solves }) => {
    const calculateAverage = (times: number[], count: number) => {
        if (times.length < count) return null;
        const sessionTimes = times.slice(0, count);

        // Sort to remove best and worst
        const sorted = [...sessionTimes].sort((a, b) => a - b);
        const trimmed = sorted.slice(1, -1);

        const sum = trimmed.reduce((acc, time) => acc + time, 0);
        return sum / trimmed.length;
    };

    const formatTime = (ms: number | null) => {
        if (ms === null) return '--';
        const seconds = Math.floor(ms / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10);
        return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
    };

    const ao5 = calculateAverage(solves, 5);
    const ao12 = calculateAverage(solves, 12);

    return (
        <div className="grid grid-cols-2 gap-8 py-10 w-full max-w-sm mx-auto">
            <div className="text-center">
                <div className="text-foreground/40 text-xs font-bold uppercase tracking-widest mb-1">ao5</div>
                <div className="text-2xl font-serif font-medium">{formatTime(ao5)}</div>
            </div>
            <div className="text-center">
                <div className="text-foreground/40 text-xs font-bold uppercase tracking-widest mb-1">ao12</div>
                <div className="text-2xl font-serif font-medium">{formatTime(ao12)}</div>
            </div>
        </div>
    );
};

export default StatsDisplay;
