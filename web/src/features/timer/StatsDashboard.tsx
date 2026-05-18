import React from 'react';
import SolveChart from './SolveChart';

interface StatsDashboardProps {
    stats: {
        best_ao5: number;
        best_ao12: number;
        best_ao100: number;
        best_time: number;
        total_solves: number;
    } | null;
    solves: any[];
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, solves }) => {
    if (!stats) return null;

    const formatTime = (seconds: number) => {
        if (!seconds || seconds === 0 || seconds === Infinity) return '--';
        const ms = seconds * 1000;
        const s = Math.floor(ms / 1000);
        const m = Math.floor((ms % 1000) / 10);
        return `${s}.${m.toString().padStart(2, '0')}`;
    };

    const StatCard = ({ label, value }: { label: string; value: string }) => (
        <div className="bg-slate-50 border border-foreground/5 rounded-2xl shadow-sm p-6 transition-all hover:shadow-md">
            <span className="text-foreground/40 text-xs font-medium tracking-wider uppercase">
                {label}
            </span>
            <div className="mt-4 text-4xl font-serif font-medium tracking-tight text-foreground">
                {value}
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-5xl mx-auto py-10 px-6">
            <div className="mb-8 animate-blur-in">
                <h2 className="text-3xl md:text-4xl font-serif font-medium tracking-tight">
                    Dashboard
                </h2>
                <p className="text-foreground/60 font-medium text-sm mt-2">
                    {stats.total_solves > 0
                        ? `${stats.total_solves} solve${stats.total_solves === 1 ? '' : 's'} tracked so far`
                        : 'Your cubing progress at a glance'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up delay-200">
                <StatCard label="Average of 5" value={formatTime(stats.best_ao5)} />
                <StatCard label="Average of 12" value={formatTime(stats.best_ao12)} />
                <StatCard label="Personal Best" value={formatTime(stats.best_time)} />
            </div>

            <div className="animate-slide-up delay-300">
                <SolveChart solves={solves} />
            </div>
        </div>
    );
};

export default StatsDashboard;
