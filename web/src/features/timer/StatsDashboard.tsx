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
        <div className="bg-surface border border-line rounded-2xl p-6 sm:p-7 transition-colors hover:border-foreground/15">
            <span className="text-foreground/45 text-[11px] font-medium tracking-[0.12em] uppercase">
                {label}
            </span>
            <div className="mt-3 flex items-baseline gap-1">
                <span className="text-5xl font-serif font-medium tracking-tight tabular-nums">
                    {value}
                </span>
                <span className="text-foreground/30 text-lg font-serif">s</span>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-12 space-y-8 sm:space-y-10">
            <header className="animate-blur-in">
                <h2 className="text-4xl font-serif font-medium tracking-tight">
                    Dashboard
                </h2>
                <p className="text-foreground/50 text-sm mt-2">
                    {stats.total_solves > 0
                        ? `${stats.total_solves} solve${stats.total_solves === 1 ? '' : 's'} tracked so far`
                        : 'Your cubing progress at a glance'}
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-slide-up delay-200">
                <StatCard label="Best Ao5" value={formatTime(stats.best_ao5)} />
                <StatCard label="Best Ao12" value={formatTime(stats.best_ao12)} />
                <StatCard label="Best single" value={formatTime(stats.best_time)} />
            </div>

            <div className="animate-slide-up delay-300">
                <SolveChart solves={solves} />
            </div>
        </div>
    );
};

export default StatsDashboard;
