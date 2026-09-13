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

const MONO_FONT = "'SF Mono', ui-monospace, monospace";

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
        borderColor: 'rgba(26, 26, 26, 0.2)',
        backgroundColor: 'transparent',
        borderWidth: 1,
        pointRadius: 0,
        tension: 0.25,
    },
    ao5: {
        label: 'AO5',
        borderColor: '#9333ea',
        backgroundColor: 'transparent',
        borderWidth: 1.25,
        pointRadius: 0,
        tension: 0.3,
    },
    ao12: {
        label: 'AO12',
        borderColor: '#c2761a',
        backgroundColor: 'transparent',
        borderWidth: 1.25,
        pointRadius: 0,
        tension: 0.3,
    },
};

export const CHART_OPTIONS: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
        legend: { display: false },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#fcfcf9',
            titleColor: '#1a1a1a',
            titleFont: { family: MONO_FONT, size: 11, weight: 'normal' },
            bodyColor: 'rgba(26, 26, 26, 0.65)',
            bodyFont: { family: MONO_FONT, size: 11 },
            borderColor: '#e7e2d5',
            borderWidth: 1,
            cornerRadius: 4,
            padding: { x: 12, y: 8 },
            boxPadding: 4,
            boxWidth: 6,
            boxHeight: 6,
            usePointStyle: true,
            bodySpacing: 4,
            titleMarginBottom: 6,
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
                font: { family: MONO_FONT, size: 9 },
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 10,
            }
        },
        y: {
            border: { display: false },
            grid: { color: '#eeeade' },
            ticks: {
                color: 'rgba(26, 26, 26, 0.35)',
                font: { family: MONO_FONT, size: 9 },
                padding: 8,
                callback: (value: number | string) => formatSecondsTime(Number(value)),
            }
        }
    }
};
