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
        const sorted = [...solves].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        if (interval === 'all') return sorted;

        const now = new Date();
        const cutoff = new Date();
        if (interval === 'hour') cutoff.setHours(now.getHours() - 1);
        else if (interval === 'day') cutoff.setDate(now.getDate() - 1);
        else if (interval === 'week') cutoff.setDate(now.getDate() - 7);
        else if (interval === 'month') cutoff.setMonth(now.getMonth() - 1);

        return sorted.filter(s => new Date(s.createdAt) >= cutoff);
    }, [solves, interval]);

    const chartData = useMemo(() => {
        const labels = filteredSolves.map(s => {
            const date = new Date(s.createdAt);
            return interval === 'hour' || interval === 'day'
                ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        });

        const times = filteredSolves.map(s => s.time);
        const ao5Series = calculateAverageSeries(times.reverse(), 5).reverse();
        const ao12Series = calculateAverageSeries(times.reverse(), 12).reverse();

        const datasets = [];

        if (showSingle) {
            datasets.push({
                label: 'Single',
                data: times,
                borderColor: 'rgba(156, 163, 175, 0.5)',
                backgroundColor: 'rgba(156, 163, 175, 0.1)',
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
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
                backgroundColor: '#fff',
                titleColor: '#111827',
                bodyColor: '#4b5563',
                borderColor: '#e5e7eb',
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
                ticks: { color: '#9ca3af', font: { size: 10 } }
            },
            y: {
                grid: { color: '#f3f4f6' },
                ticks: { color: '#9ca3af', font: { size: 10 }, callback: (value: any) => `${value}s` }
            }
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Solve Insights</h3>
                    <p className="text-gray-400 text-xs">Analyze your progress over time</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Interval Selectors */}
                    <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                        {(['hour', 'day', 'week', 'month', 'all'] as Interval[]).map((int) => (
                            <button
                                key={int}
                                onClick={() => setInterval(int)}
                                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${interval === int ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {int}
                            </button>
                        ))}
                    </div>

                    {/* Series Toggles */}
                    <div className="flex gap-2 ml-2">
                        <button
                            onClick={() => setShowSingle(!showSingle)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${showSingle ? 'border-gray-200 bg-gray-50 text-gray-700' : 'border-transparent text-gray-300'
                                }`}
                        >
                            Single
                        </button>
                        <button
                            onClick={() => setShowAO5(!showAO5)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${showAO5 ? 'border-purple-100 bg-purple-50 text-purple-700' : 'border-transparent text-gray-300'
                                }`}
                        >
                            AO5
                        </button>
                        <button
                            onClick={() => setShowAO12(!showAO12)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${showAO12 ? 'border-blue-100 bg-blue-50 text-blue-700' : 'border-transparent text-gray-300'
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
