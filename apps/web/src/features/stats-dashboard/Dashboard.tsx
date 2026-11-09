import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SolveChart from './SolveChart';
import StatCard from './StatCard';
import type { Doc } from '@convex/_generated/dataModel';
import { calculateAO12, calculateAO5, formatSecondsTime } from '@/lib/stats';

const TrainingThumb = lazy(() => import('./TrainingThumb'));

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

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
const CARD = `block rounded-lg border border-line hover:border-foreground/25 transition-colors ${FOCUS}`;
const PRIMARY = `inline-flex items-center gap-2 h-9 px-4 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/85 transition-colors ${FOCUS}`;
const THUMB = 'h-36 w-full';

const TRAINING = [
    {
        to: '/training/square1-cubeshape',
        title: 'Square-1 cubeshape',
        body: 'Random-state scrambles for the cubeshape cases you pick.',
        thumb: <Suspense fallback={<div className={THUMB} />}><TrainingThumb puzzle="sq1" className={THUMB} /></Suspense>,
    },
    {
        to: '/training/3bld',
        title: '3BLD tracing',
        body: 'Trace Old Pochmann edge and corner cycles from a scramble.',
        thumb: <Suspense fallback={<div className={THUMB} />}><TrainingThumb puzzle="3x3" className={THUMB} /></Suspense>,
    },
    {
        to: '/training/3bld-memo',
        title: 'Letter memo',
        body: 'Memorize Speffz letter pairs, then recall them in order.',
        thumb: (
            <div className={`${THUMB} flex items-center justify-center gap-4 font-mono text-3xl font-medium tracking-widest text-foreground/25`}>
                <span>AB</span>
                <span>CD</span>
            </div>
        ),
    },
];

const MORE = [
    { to: '/lists', title: 'Alg lists', body: 'Keep your algorithms with a diagram of each case, and share a list by link.' },
    { to: '/competitions', title: 'Competitions', body: 'Find upcoming WCA competitions by country and bookmark the ones you plan to attend.' },
];

const SectionHeading = ({ id, children, link }: { id: string; children: React.ReactNode; link?: { to: string; label: string } }) => (
    <div className="flex items-baseline justify-between gap-4 mb-3">
        <h2 id={id} className="text-base font-semibold">{children}</h2>
        {link && (
            <Link to={link.to} className={`text-sm text-foreground/55 hover:text-foreground rounded-sm ${FOCUS}`}>
                {link.label}
            </Link>
        )}
    </div>
);

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, solves }) => {
    if (!stats) return null;

    const hasSolves = stats.total_solves > 0;
    const recent = solves.slice(-5).reverse();
    const newestFirst = solves.map((s) => (s.dnf ? Infinity : s.time)).reverse();

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-12 space-y-12">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight">Dashboard</h1>
                    <p className="text-foreground/55 text-sm mt-2">
                        {hasSolves
                            ? `${stats.total_solves} solve${stats.total_solves === 1 ? '' : 's'} tracked.`
                            : 'Time your solves, train specific skills, and keep your algorithms in one place.'}
                    </p>
                </div>
                {hasSolves && (
                    <Link to="/timer" className={PRIMARY}>
                        Start timer <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                    </Link>
                )}
            </header>

            {hasSolves ? (
                <>
                    <section aria-labelledby="bests">
                        <SectionHeading id="bests">Personal bests</SectionHeading>
                        <dl className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-line border border-line rounded-lg overflow-hidden">
                            <StatCard label="Single" value={formatSecondsTime(stats.best_time)} className="col-span-2 lg:col-span-1" />
                            <StatCard label="Ao5" value={formatSecondsTime(stats.best_ao5)} />
                            <StatCard label="Ao12" value={formatSecondsTime(stats.best_ao12)} />
                            <StatCard label="Ao100" value={formatSecondsTime(stats.best_ao100)} />
                            <StatCard label="Total solves" value={stats.total_solves.toLocaleString()} />
                        </dl>
                    </section>

                    <div className="grid gap-8 xl:grid-cols-3">
                        <section aria-labelledby="progress" className="xl:col-span-2 min-w-0">
                            <SolveChart solves={solves} headingId="progress" />
                        </section>

                        <section aria-labelledby="recent">
                            <SectionHeading id="recent" link={{ to: '/timer', label: 'All solves' }}>Recent solves</SectionHeading>
                            <p className="text-sm text-foreground/55 mb-3">
                                Current ao5 <span className="font-mono tabular-nums text-foreground">{formatSecondsTime(calculateAO5(newestFirst))}</span>
                                <span className="mx-2 text-foreground/25">/</span>
                                ao12 <span className="font-mono tabular-nums text-foreground">{formatSecondsTime(calculateAO12(newestFirst))}</span>
                            </p>
                            <ol className="border-t border-line">
                                {recent.map((s) => (
                                    <li key={s._id} className="flex items-baseline gap-4 py-2.5 border-b border-line">
                                        <span className={`w-16 shrink-0 font-mono tabular-nums ${s.dnf ? 'text-foreground/45' : ''}`}>
                                            {s.dnf ? 'DNF' : formatSecondsTime(s.time)}
                                        </span>
                                        <span className="min-w-0 truncate font-mono text-xs text-foreground/45" title={s.scramble}>
                                            {s.scramble}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    </div>
                </>
            ) : (
                <section aria-labelledby="first-solve" className="rounded-lg border border-line px-6 py-10 sm:px-10 sm:py-14">
                    <h2 id="first-solve" className="text-xl font-semibold">Do your first solve</h2>
                    <p className="mt-2 max-w-md text-sm text-foreground/60">
                        Open the timer, hold space until it's ready, release to start, and press any key to stop. Your personal bests, averages and progress chart will show up here.
                    </p>
                    <Link to="/timer" className={`${PRIMARY} mt-6`}>
                        Open timer <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                    </Link>
                </section>
            )}

            <section aria-labelledby="training">
                <SectionHeading id="training" link={{ to: '/training', label: 'All training' }}>Training</SectionHeading>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {TRAINING.map((t) => (
                        <li key={t.to}>
                            <Link to={t.to} className={`${CARD} h-full overflow-hidden`}>
                                <div className="border-b border-line bg-surface" aria-hidden="true">{t.thumb}</div>
                                <div className="p-4">
                                    <h3 className="text-sm font-medium">{t.title}</h3>
                                    <p className="mt-1 text-sm text-foreground/55">{t.body}</p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            <section aria-labelledby="more">
                <SectionHeading id="more">Lists and competitions</SectionHeading>
                <ul className="grid gap-4 sm:grid-cols-2">
                    {MORE.map((m) => (
                        <li key={m.to}>
                            <Link to={m.to} className={`${CARD} group h-full p-4`}>
                                <h3 className="flex items-center justify-between gap-2 text-sm font-medium">
                                    {m.title}
                                    <ArrowRight className="w-4 h-4 text-foreground/35 group-hover:text-foreground transition-colors" strokeWidth={1.75} />
                                </h3>
                                <p className="mt-1 text-sm text-foreground/55">{m.body}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
};

export default StatsDashboard;
