import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { calculateAverageSeries } from '@/lib/stats';
import type { Doc } from '@convex/_generated/dataModel';
import { useThemeStore } from '@/stores/themeStore';
import { chartOptions, INTERVALS, SERIES_STYLE, type Interval, type Series } from './SolveChart.config';

interface SolveChartProps {
    solves: Doc<'solves'>[];
    headingId?: string;
}

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

const SolveChart: React.FC<SolveChartProps> = ({ solves, headingId }) => {
    const dark = useThemeStore((s) => s.theme === 'dark');
    const options = useMemo(() => chartOptions(dark), [dark]);
    const [interval, setInterval] = useState<Interval>('all');
    const [visible, setVisible] = useState<Record<Series, boolean>>({ single: true, ao5: true, ao12: true });
    const [scrollMode, setScrollMode] = useState(false);
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
        const labels = filteredSolves.map(s => {
            const date = new Date(s._creationTime);
            return interval === 'hour' || interval === 'day'
                ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        });

        // DNFs average as Infinity; plot them (and DNF averages) as gaps.
        const times = filteredSolves.map(s => (s.dnf ? Infinity : s.time));
        const gap = (xs: (number | null)[]) => xs.map(x => (x === Infinity ? null : x));
        const ao5Series = calculateAverageSeries([...times].reverse(), 5).reverse();
        const ao12Series = calculateAverageSeries([...times].reverse(), 12).reverse();
        const seriesData: Record<Series, (number | null)[]> = { single: gap(times), ao5: gap(ao5Series), ao12: gap(ao12Series) };

        const datasets = (Object.keys(SERIES_STYLE) as Series[])
            .filter(key => visible[key])
            .map(key => ({
                ...SERIES_STYLE[key],
                ...(key === 'single' && dark && { borderColor: 'rgba(247, 248, 248, 0.2)' }),
                data: seriesData[key],
                fill: false,
            }));

        return { labels, datasets };
    }, [filteredSolves, visible, interval, dark]);

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
                        {filteredSolves.length} solve{filteredSolves.length === 1 ? '' : 's'}
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
                        <button onClick={() => toggle('single')} aria-pressed={visible.single} className={seriesBtn(visible.single)}>
                            Single
                        </button>
                        <button onClick={() => toggle('ao5')} aria-pressed={visible.ao5} className={seriesBtn(visible.ao5, 'text-[#9333ea]')}>
                            Ao5
                        </button>
                        <button onClick={() => toggle('ao12')} aria-pressed={visible.ao12} className={seriesBtn(visible.ao12, 'text-[#c2761a]')}>
                            Ao12
                        </button>
                    </div>
                </div>
            </div>

            <div className="h-64 w-full overflow-x-auto">
                <div
                    className="h-full"
                    style={scrollMode ? { width: Math.max(filteredSolves.length * 14, 100) } : { width: '100%' }}
                >
                    <Line data={chartData} options={options} />
                </div>
            </div>
        </div>
    );
};

export default SolveChart;
