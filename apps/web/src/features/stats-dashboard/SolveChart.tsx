import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { calculateAverageSeries, effectiveSeconds } from '@/lib/stats';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { chartOptions, INTERVALS, SERIES_COLOR, SERIES_STYLE, type Interval, type Series } from './SolveChart.config';

interface SolveChartProps {
    headingId?: string;
}

const MINUTE = 60_000;

const windowStart = (interval: Exclude<Interval, 'all'>) => {
    const cutoff = new Date();
    if (interval === 'hour') cutoff.setHours(cutoff.getHours() - 1);
    else if (interval === 'day') cutoff.setDate(cutoff.getDate() - 1);
    else if (interval === 'week') cutoff.setDate(cutoff.getDate() - 7);
    else cutoff.setMonth(cutoff.getMonth() - 1);
    return Math.floor(cutoff.getTime() / MINUTE) * MINUTE;
};

const DETAIL_SERIES: Series[] = ['single', 'ao5', 'ao12'];
const DAILY_SERIES: Series[] = ['mean', 'best'];

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

const SolveChart: React.FC<SolveChartProps> = ({ headingId }) => {
    const token = useAuthStore((s) => s.token);
    const dark = useThemeStore((s) => s.theme === 'dark');
    const options = useMemo(() => chartOptions(dark), [dark]);
    const [interval, setInterval] = useState<Interval>('all');
    const [visible, setVisible] = useState<Record<Series, boolean>>({ single: true, ao5: true, ao12: true, mean: true, best: true });
    const [scrollMode, setScrollMode] = useState(false);
    const toggle = (series: Series) => setVisible(v => ({ ...v, [series]: !v[series] }));

    const daily = interval === 'all';
    // Fixed per interval selection: a cutoff that moved on every render would resubscribe the query each time.
    const since = useMemo(() => (daily ? 0 : windowStart(interval)), [daily, interval]);
    const buckets = useQuery(api.solve.getSolveBuckets, token && daily ? { token } : 'skip');
    const solves = useQuery(api.solve.getSolvesSince, token && !daily ? { token, since } : 'skip');
    const loading = daily ? buckets === undefined : solves === undefined;

    const seriesKeys = daily ? DAILY_SERIES : DETAIL_SERIES;
    const points = daily ? (buckets?.length ?? 0) : (solves?.length ?? 0);
    const solveCount = daily ? (buckets ?? []).reduce((n, b) => n + b.count + b.dnfs, 0) : points;

    const chartData = useMemo(() => {
        const dateLabel = (t: number) => new Date(t).toLocaleDateString([], { month: 'short', day: 'numeric', ...(daily && { timeZone: 'UTC' }) });
        let labels: string[] = [];
        let seriesData: Partial<Record<Series, (number | null)[]>> = {};

        if (daily) {
            labels = (buckets ?? []).map(b => dateLabel(b.day));
            seriesData = { mean: (buckets ?? []).map(b => b.mean), best: (buckets ?? []).map(b => b.best) };
        } else {
            const list = solves ?? [];
            labels = list.map(s => {
                const date = new Date(s._creationTime);
                return interval === 'hour' || interval === 'day'
                    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : dateLabel(s._creationTime);
            });
            // DNFs average as Infinity; plot them (and DNF averages) as gaps.
            const times = list.map(effectiveSeconds);
            const gap = (xs: (number | null)[]) => xs.map(x => (x === Infinity ? null : x));
            seriesData = {
                single: gap(times),
                ao5: gap(calculateAverageSeries([...times].reverse(), 5).reverse()),
                ao12: gap(calculateAverageSeries([...times].reverse(), 12).reverse()),
            };
        }

        const datasets = seriesKeys
            .filter(key => visible[key])
            .map(key => ({
                ...SERIES_STYLE[key],
                ...(key === 'single' && dark && { borderColor: 'rgba(247, 248, 248, 0.2)' }),
                data: seriesData[key] ?? [],
                fill: false,
            }));

        return { labels, datasets };
    }, [buckets, solves, seriesKeys, visible, interval, daily, dark]);

    const seg = (on: boolean) =>
        `px-2.5 py-1 text-xs rounded transition-colors ${FOCUS} ${on ? 'bg-foreground text-background' : 'text-foreground/50 hover:text-foreground'}`;
    const seriesBtn = (on: boolean, color?: string) =>
        `px-2.5 py-1 rounded-md border text-xs transition-colors ${FOCUS} ${on
            ? `${color ?? 'text-foreground/70'} border-line`
            : 'border-transparent text-foreground/30 hover:text-foreground/60'}`;

    return (
        <div className="rounded-lg border border-line p-4 sm:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 id={headingId} className="text-base font-semibold">Progress</h2>
                    <p className="text-foreground/55 text-sm mt-0.5 font-mono tabular-nums">
                        {solveCount.toLocaleString()} solve{solveCount === 1 ? '' : 's'}{daily && ', by day'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex p-0.5 rounded-md border border-line" role="group" aria-label="Time range">
                        {INTERVALS.map((int) => (
                            <button
                                key={int}
                                onClick={() => setInterval(int)}
                                aria-pressed={interval === int}
                                className={`${seg(interval === int)} capitalize`}
                            >
                                {int}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setScrollMode(s => !s)}
                        aria-pressed={scrollMode}
                        className={seriesBtn(scrollMode)}
                        title="Toggle between fitting all points and scrolling through detail"
                    >
                        {scrollMode ? 'Scroll' : 'Fit'}
                    </button>

                    <div className="flex gap-1" role="group" aria-label="Series">
                        {seriesKeys.map((key) => (
                            <button key={key} onClick={() => toggle(key)} aria-pressed={visible[key]} className={seriesBtn(visible[key], SERIES_COLOR[key])}>
                                {SERIES_STYLE[key].label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="h-64 w-full overflow-x-auto">
                {loading ? (
                    <div className="h-full" aria-busy="true" />
                ) : (
                    <div
                        className="h-full"
                        style={scrollMode ? { width: Math.max(points * 14, 100) } : { width: '100%' }}
                    >
                        <Line data={chartData} options={options} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SolveChart;
