import { useState, useCallback, useEffect, useContext } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { AuthContext } from '@/contexts/AuthContext';
import ScrambleDisplay from '@/features/timer/ScrambleDisplay';
import TimerDisplay from '@/features/timer/TimerDisplay';
import StatsDisplay from '@/features/timer/StatsDisplay';
import SolveHistory from '@/features/timer/SolveHistory';
import type { Solve } from '@/features/timer/SolveHistory';
import { generateScramble } from '@/lib/scramble';
import Loading from '@/components/Loading';
import { calculateAO5, calculateAO12 } from '@/lib/stats';

const Timer = () => {
    const auth = useContext(AuthContext);
    const [currentScramble, setCurrentScramble] = useState(generateScramble());
    const [solves, setSolves] = useState<Solve[]>([]);
    const [isTiming, setIsTiming] = useState(false);

    const createSolveMutation = useMutation(api.solve.createSolve);
    const deleteSolveMutation = useMutation(api.solve.deleteSolve);

    const solvesData = useQuery(api.solve.getSolves, auth?.token ? { token: auth.token } : 'skip');
    const statsData = useQuery(api.solve.getStats, auth?.token ? { token: auth.token } : 'skip');

    useEffect(() => {
        if (solvesData) {
            const formattedSolves = solvesData.map((s: any) => ({
                id: s._id,
                time: s.time * 1000,
                scramble: s.scramble,
                timestamp: s._creationTime
            })).reverse();
            setSolves(formattedSolves);
        }
    }, [solvesData]);

    const handleSolveComplete = useCallback(async (timeMs: number) => {
        const timeSec = timeMs / 1000;

        if (!auth?.token) {
            console.error('Not authenticated');
            return;
        }

        // Optimistic update
        const tempId = crypto.randomUUID();
        const newSolve: Solve = {
            id: tempId,
            time: timeMs,
            scramble: currentScramble,
            timestamp: Date.now(),
        };
        setSolves(prev => [newSolve, ...prev]);
        setCurrentScramble(generateScramble());

        try {
            await createSolveMutation({
                token: auth.token,
                cubeType: '3x3',
                time: timeSec,
                scramble: currentScramble,
                dnf: false
            });
        } catch (e) {
            console.error('Failed to save solve', e);
            setSolves(prev => prev.filter(s => s.id !== tempId));
        }
    }, [currentScramble, auth?.token, createSolveMutation]);

    const handleDeleteSolve = useCallback(async (id: string) => {
        if (!auth?.token) {
            console.error('Not authenticated');
            return;
        }

        // Optimistic delete
        const originalSolves = [...solves];
        setSolves(prev => prev.filter(s => s.id !== id));

        try {
            await deleteSolveMutation({
                token: auth.token,
                solveId: id as Id<'solves'>
            });
        } catch (e) {
            console.error('Failed to delete solve', e);
            setSolves(originalSolves);
        }
    }, [solves, auth?.token, deleteSolveMutation]);

    const handleStart = useCallback(() => setIsTiming(true), []);
    const handleStop = useCallback(() => setIsTiming(false), []);

    if (!solvesData || !statsData) {
        return <Loading />;
    }

    return (
        <div className="min-h-full py-12 px-6 flex flex-col items-center tracking-tight">
            <div className={`w-full max-w-4xl transition-opacity duration-300 ${isTiming ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <ScrambleDisplay scramble={currentScramble} />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full">
                <TimerDisplay
                    onSolveComplete={handleSolveComplete}
                    onStart={handleStart}
                    onStop={handleStop}
                />

                <div className={`w-full transition-all duration-500 transform ${isTiming ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                    <StatsDisplay
                        stats={statsData}
                        runningAO5={calculateAO5(solves.map(s => s.time / 1000))}
                        runningAO12={calculateAO12(solves.map(s => s.time / 1000))}
                    />
                    <SolveHistory solves={solves} onDeleteSolve={handleDeleteSolve} />
                </div>
            </div>
        </div>
    );
};

export default Timer;
