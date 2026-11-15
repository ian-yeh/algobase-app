import { useState, useCallback, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, usePaginatedQuery } from 'convex/react';
import { Menu } from 'lucide-react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { useAuthStore } from '@/stores/authStore';
import type { LayoutContext } from '@/features/layout/Layout';
import ScrambleDisplay from '@/features/timer/ScrambleDisplay';
import TimerDisplay from '@/features/timer/TimerDisplay';
import StatsDisplay from '@/features/timer/StatsDisplay';
import SolveHistory from '@/features/timer/SolveHistory';
import SolveDetailModal from '@/features/timer/SolveDetailModal';
import type { Solve } from '@/features/timer/SolveHistory';
import { generateScramble } from '@/lib/scramble';
import Loading from '@/components/Loading';
import { calculateAO5, calculateAO12, effectiveSeconds, penaltyOf, type Penalty } from '@/lib/stats';
import PenaltyButtons from '@/features/timer/PenaltyButtons';

const Timer = () => {
    const token = useAuthStore((s) => s.token);
    const [currentScramble, setCurrentScramble] = useState(generateScramble);
    const [solves, setSolves] = useState<Solve[]>([]);
    const [isTiming, setIsTiming] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    // The solve just finished on this page, once saved: the one the quick penalty buttons apply to.
    const [lastSolveId, setLastSolveId] = useState<string | null>(null);
    const { menuOpen, openMenu } = useOutletContext<LayoutContext>();

    const createSolveMutation = useMutation(api.solve.createSolve);
    const deleteSolveMutation = useMutation(api.solve.deleteSolve);
    const setPenaltyMutation = useMutation(api.solve.setPenalty);

    const { results: solvesData, status: solvesStatus, loadMore } = usePaginatedQuery(
        api.solve.listSolves,
        token ? { token } : 'skip',
        { initialNumItems: 50 }
    );
    const statsData = useQuery(api.solve.getStats, token ? { token } : 'skip');

    useEffect(() => {
        setSolves(solvesData.map((s) => ({
            id: s._id,
            time: s.time,
            scramble: s.scramble,
            timestamp: s._creationTime,
            dnf: s.dnf,
            plus2: s.plus2,
        })));
    }, [solvesData]);

    const handleSolveComplete = useCallback(async (timeMs: number) => {
        const timeSec = timeMs / 1000;

        if (!token) {
            console.error('Not authenticated');
            return;
        }

        const tempId = crypto.randomUUID();
        const newSolve: Solve = {
            id: tempId,
            time: timeSec,
            scramble: currentScramble,
            timestamp: Date.now(),
        };
        setSolves(prev => [newSolve, ...prev]);
        setCurrentScramble(generateScramble());
        setLastSolveId(null);

        try {
            const id = await createSolveMutation({
                token,
                cubeType: '3x3',
                time: timeSec,
                scramble: currentScramble,
                dnf: false
            });
            setSolves(prev => prev.map(s => (s.id === tempId ? { ...s, id } : s)));
            setLastSolveId(id);
        } catch (e) {
            console.error('Failed to save solve', e);
            setSolves(prev => prev.filter(s => s.id !== tempId));
        }
    }, [currentScramble, token, createSolveMutation]);

    const handleDeleteSolve = useCallback(async (id: string) => {
        if (!token) {
            console.error('Not authenticated');
            return;
        }

        const originalSolves = [...solves];
        setSolves(prev => prev.filter(s => s.id !== id));

        try {
            await deleteSolveMutation({
                token,
                solveId: id as Id<'solves'>
            });
        } catch (e) {
            console.error('Failed to delete solve', e);
            setSolves(originalSolves);
        }
    }, [solves, token, deleteSolveMutation]);

    const handleSetPenalty = useCallback(async (id: string, penalty: Penalty) => {
        if (!token) return;
        const originalSolves = solves;
        setSolves(prev => prev.map(s => (s.id === id ? { ...s, dnf: penalty === 'dnf', plus2: penalty === 'plus2' } : s)));
        try {
            await setPenaltyMutation({ token, solveId: id as Id<'solves'>, penalty });
        } catch (e) {
            console.error('Failed to set penalty', e);
            setSolves(originalSolves);
        }
    }, [solves, token, setPenaltyMutation]);

    const handleStart = useCallback(() => setIsTiming(true), []);
    const handleStop = useCallback(() => setIsTiming(false), []);
    const handleLoadMore = useCallback(() => {
        if (solvesStatus === 'CanLoadMore') loadMore(50);
    }, [solvesStatus, loadMore]);

    const selectedSolve = solves.find(s => s.id === selectedId) ?? null;
    const lastSolve = solves[0]?.id === lastSolveId ? solves[0] : null;

    if (solvesStatus === 'LoadingFirstPage' || !statsData) {
        return <Loading />;
    }

    const chrome = `transition-opacity duration-300 ${isTiming ? 'opacity-0' : 'opacity-100'}`;

    return (
        <div className="flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden font-sans tracking-tight">
            <div className="relative flex-1 min-h-[36rem] lg:min-h-0">
                <TimerDisplay
                    onSolveComplete={handleSolveComplete}
                    onStart={handleStart}
                    onStop={handleStop}
                    disabled={!!selectedSolve || menuOpen}
                    footer={lastSolve && (
                        <PenaltyButtons
                            penalty={penaltyOf(lastSolve)}
                            onChange={(penalty) => handleSetPenalty(lastSolve.id, penalty)}
                        />
                    )}
                />

                <div className={`absolute inset-x-0 top-0 z-10 pointer-events-none ${chrome}`}>
                    <header className="h-14 px-4 md:px-6 flex items-center">
                        <button
                            type="button"
                            onClick={openMenu}
                            aria-label="Open menu"
                            className="pointer-events-auto p-1.5 -ml-1.5 rounded-lg text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </header>
                    <div className="2xl:pl-96">
                        <ScrambleDisplay
                            scramble={currentScramble}
                            onNewScramble={() => setCurrentScramble(generateScramble())}
                        />
                    </div>
                </div>

                <div className={`absolute inset-x-0 bottom-0 z-10 px-4 2xl:pl-100 pb-16 md:pb-32 ${chrome}`}>
                    <StatsDisplay
                        stats={statsData}
                        runningAO5={calculateAO5(solves.map(effectiveSeconds))}
                        runningAO12={calculateAO12(solves.map(effectiveSeconds))}
                    />
                </div>
            </div>

            <aside className={`w-full lg:w-96 shrink-0 border-t lg:border-t-0 lg:border-l border-foreground/5 max-h-80 lg:max-h-none lg:h-full transition-opacity duration-300 ${isTiming ? 'hidden lg:block lg:opacity-0 lg:pointer-events-none' : 'opacity-100'}`}>
                <SolveHistory
                    solves={solves}
                    total={statsData.total_solves}
                    onLoadMore={handleLoadMore}
                    onSelectSolve={(s) => setSelectedId(s.id)}
                    onDeleteSolve={handleDeleteSolve}
                />
            </aside>

            <SolveDetailModal
                solve={selectedSolve}
                onClose={() => setSelectedId(null)}
                onDelete={handleDeleteSolve}
                onSetPenalty={handleSetPenalty}
            />
        </div>
    );
};

export default Timer;
