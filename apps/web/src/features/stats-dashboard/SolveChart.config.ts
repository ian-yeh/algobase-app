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
    type TooltipItem,
    type ChartOptions,
} from 'chart.js';
import { formatSecondsTime } from '@/lib/stats';

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

export type Interval = 'hour' | 'day' | 'week' | 'month' | 'all';
export type Series = 'single' | 'ao5' | 'ao12';

export const INTERVALS: Interval[] = ['hour', 'day', 'week', 'month', 'all'];

export const SERIES_STYLE: Record<Series, {
    label: string;
    borderColor: string;
    backgroundColor: string;
    borderWidth: number;
    borderDash?: number[];
    pointRadius: number;
    tension: number;
}> = {
    single: {
        label: 'Single',
        borderColor: 'rgba(26, 26, 26, 0.18)',
        backgroundColor: 'rgba(26, 26, 26, 0.05)',
        borderWidth: 1.5,
        pointRadius: 2,
        tension: 0.3,
    },
    ao5: {
        label: 'AO5',
        borderColor: 'rgba(26, 26, 26, 0.85)',
        backgroundColor: 'rgba(26, 26, 26, 0.06)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
    },
    ao12: {
        label: 'AO12',
        borderColor: 'rgba(26, 26, 26, 0.4)',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [4, 3],
        pointRadius: 0,
        tension: 0.4,
    },
};

export const CHART_OPTIONS: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#fcfcf9',
            titleColor: '#1a1a1a',
            titleFont: { family: "'Newsreader', serif", size: 13, weight: 'normal' },
            bodyColor: 'rgba(26, 26, 26, 0.65)',
            bodyFont: { size: 12 },
            borderColor: '#e7e2d5',
            borderWidth: 1,
            cornerRadius: 10,
            padding: { x: 16, y: 12 },
            boxPadding: 6,
            boxWidth: 8,
            boxHeight: 8,
            usePointStyle: true,
            bodySpacing: 6,
            titleMarginBottom: 8,
            displayColors: true,
            callbacks: {
                label: (context: TooltipItem<'line'>) => `${context.dataset.label}: ${formatSecondsTime(context.parsed.y as number)}`
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
            ticks: { color: 'rgba(26, 26, 26, 0.35)', font: { size: 10 }, padding: 8, callback: (value: number | string) => formatSecondsTime(Number(value)) }
        }
    }
};
