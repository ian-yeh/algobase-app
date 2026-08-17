import React, { useState, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { calculateAverageSeries } from '@/lib/stats';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface SolveChartProps {
    solves: any[];
}

type Interval = 'hour' | 'day' | 'week' | 'month' | 'all';

const SolveChart: React.FC<SolveChartProps> = ({ solves }) => {
    const [interval, setInterval] = useState<Interval>('all');
    const [showSingle, setShowSingle] = useState(true);
    const [showAO5, setShowAO5] = useState(true);
    const [showAO12, setShowAO12] = useState(true);

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
        const ao5Series = calculateAverageSeries(times.reverse(), 5).reverse();
        const ao12Series = calculateAverageSeries(times.reverse(), 12).reverse();

        const datasets = [];

        if (showSingle) {
            datasets.push({
                label: 'Single',
                data: times,
                borderColor: 'rgba(120, 113, 108, 0.35)',
                backgroundColor: 'rgba(120, 113, 108, 0.08)',
                borderWidth: 1.5,
                pointRadius: 2,
                tension: 0.3,
                fill: false,
            });
        }

        if (showAO5) {
            datasets.push({
                label: 'AO5',
                data: ao5Series,
                borderColor: '#9333ea',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
                fill: false,
            });
        }

        if (showAO12) {
            datasets.push({
                label: 'AO12',
                data: ao12Series,
                borderColor: '#c2761a',
                backgroundColor: 'rgba(194, 118, 26, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
                fill: false,
            });
        }

        return { labels, datasets };
    }, [filteredSolves, showSingle, showAO5, showAO12, interval]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: '#fcfcf9',
                titleColor: '#1a1a1a',
                bodyColor: 'rgba(26, 26, 26, 0.6)',
                borderColor: '#e7e2d5',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: (context: any) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}s`
                }
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: 'rgba(26, 26, 26, 0.35)',
                    font: { size: 10 },
                    maxRotation: 0,
                    autoSkip: false,
                }
            },
            y: {
                border: { display: false },
                grid: { color: '#eeeade' },
                ticks: { color: 'rgba(26, 26, 26, 0.35)', font: { size: 10 }, padding: 8, callback: (value: any) => `${value}s` }
            }
        }
    };

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
                        {(['hour', 'day', 'week', 'month', 'all'] as Interval[]).map((int) => (
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
                            onClick={() => setShowSingle(!showSingle)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${showSingle
                                ? 'border-line bg-background text-foreground/70'
                                : 'border-transparent text-foreground/30'
                                }`}
                        >
                            Single
                        </button>
                        <button
                            onClick={() => setShowAO5(!showAO5)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${showAO5
                                ? 'border-accent/20 bg-accent/8 text-accent'
                                : 'border-transparent text-foreground/30'
                                }`}
                        >
                            AO5
                        </button>
                        <button
                            onClick={() => setShowAO12(!showAO12)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${showAO12
                                ? 'border-accent-warm/25 bg-accent-warm/8 text-accent-warm'
                                : 'border-transparent text-foreground/30'
                                }`}
                        >
                            AO12
                        </button>
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default SolveChart;
