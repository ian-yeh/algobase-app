import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { calculateAverageSeries } from '@/lib/stats';
import type { Doc } from '@convex/_generated/dataModel';
import { CHART_OPTIONS, INTERVALS, SERIES_STYLE, type Interval, type Series } from './SolveChart.config';

interface SolveChartProps {
    solves: Doc<'solves'>[];
}

const SolveChart: React.FC<SolveChartProps> = ({ solves }) => {
    const [interval, setInterval] = useState<Interval>('all');
    const [visible, setVisible] = useState<Record<Series, boolean>>({ single: true, ao5: true, ao12: true });
    const toggle = (series: Series) => setVisible(v => ({ ...v, [series]: !v[series] }));

    const filteredSolves = useMemo(() => {
        const sorted = [...solves].sort((a, b) => a._creationTime - b._creationTime);
        if (interval === 'all') return sorted;

        const now = new Date();
        const cutoff = new Date();
        if (interval === 'hour') cutoff.setHours(now.getHours() - 1);
        else if (interval === 'day') cutoff.setDate(now.getDate() - 1);
        else if (interval === 'week') cutoff.setDate(now.getDate() - 7);
        else if (interval === 'month') cutoff.setMonth(now.getMonth() - 1);

        return sorted.filter(s => s._creationTime >= cutoff.getTime());
    }, [solves, interval]);

    const chartData = useMemo(() => {
        const allLabels = filteredSolves.map(s => {
            const date = new Date(s._creationTime);
            return interval === 'hour' || interval === 'day'
                ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        });
        // only label a point when its date/time bucket changes
        const labels = allLabels.map((l, i) => (i > 0 && l === allLabels[i - 1] ? '' : l));

        const times = filteredSolves.map(s => s.time);
        const ao5Series = calculateAverageSeries([...times].reverse(), 5).reverse();
        const ao12Series = calculateAverageSeries([...times].reverse(), 12).reverse();
        const seriesData: Record<Series, (number | null)[]> = { single: times, ao5: ao5Series, ao12: ao12Series };

        const datasets = (Object.keys(SERIES_STYLE) as Series[])
            .filter(key => visible[key])
            .map(key => ({ ...SERIES_STYLE[key], data: seriesData[key], fill: false }));

        return { labels, datasets };
    }, [filteredSolves, visible, interval]);

    return (
        <div className="bg-surface rounded-2xl border border-line p-5 sm:p-7">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h3 className="text-xl font-serif font-medium tracking-tight text-foreground">
                        Solve Insights
                    </h3>
                    <p className="text-foreground/60 text-xs mt-1">
                        Analyze your progress over time
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex bg-background p-1 rounded-lg border border-line">
                        {INTERVALS.map((int) => (
                            <button
                                key={int}
                                onClick={() => setInterval(int)}
                                className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md transition-all ${interval === int
                                    ? 'bg-foreground text-background shadow-sm'
                                    : 'text-foreground/40 hover:text-foreground'
                                    }`}
                            >
                                {int}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 ml-2">
                        <button
                            onClick={() => toggle('single')}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${visible.single
                                ? 'border-line bg-background text-foreground/70'
                                : 'border-transparent text-foreground/30'
                                }`}
                        >
                            Single
                        </button>
                        <button
                            onClick={() => toggle('ao5')}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${visible.ao5
                                ? 'border-line bg-foreground text-background'
                                : 'border-transparent text-foreground/30'
                                }`}
                        >
                            AO5
                        </button>
                        <button
                            onClick={() => toggle('ao12')}
                            className={`px-3 py-1.5 rounded-lg border border-dashed text-xs font-medium transition-all ${visible.ao12
                                ? 'border-foreground/30 bg-background text-foreground/70'
                                : 'border-transparent text-foreground/30'
                                }`}
                        >
                            AO12
                        </button>
                    </div>
                </div>
            </div>

            <div className="h-75 w-full">
                <Line data={chartData} options={CHART_OPTIONS} />
            </div>
        </div>
    );
};

export default SolveChart;
