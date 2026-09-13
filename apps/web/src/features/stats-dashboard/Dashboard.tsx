import React from 'react';
import SolveChart from './SolveChart';
import StatCard from './StatCard';
import type { Doc } from '@convex/_generated/dataModel';
import { formatSecondsTime } from '@/features/timer/timer.utils';

interface StatsDashboardProps {
    stats: {
        best_ao5: number;
        best_ao12: number;
        best_ao100: number;
        best_time: number;
        total_solves: number;
    } | null;
    solves: Doc<'solves'>[];
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, solves }) => {
    if (!stats) return null;

    return (
        <div className="w-full max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-12 space-y-8 sm:space-y-10">
            <header className="animate-blur-in">
                <h2 className="text-3xl md:text-4xl font-serif font-medium tracking-tight">
                    Dashboard
                </h2>
                <p className="text-foreground/50 text-sm mt-2">
                    {stats.total_solves > 0
                        ? `${stats.total_solves} solve${stats.total_solves === 1 ? '' : 's'} tracked so far`
                        : 'Your cubing progress at a glance'}
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-slide-up delay-200">
                <StatCard label="Best Ao5" value={formatSecondsTime(stats.best_ao5)} />
                <StatCard label="Best Ao12" value={formatSecondsTime(stats.best_ao12)} />
                <StatCard label="Best single" value={formatSecondsTime(stats.best_time)} />
            </div>

            <div className="animate-slide-up delay-300">
                <SolveChart solves={solves} />
            </div>
        </div>
    );
};

export default StatsDashboard;
