import { useState, useCallback, useEffect } from 'react';
import ScrambleDisplay from '@/features/timer/ScrambleDisplay';
import TimerDisplay from '@/features/timer/TimerDisplay';
import StatsDisplay from '@/features/timer/StatsDisplay';
import SolveHistory from '@/features/timer/SolveHistory';
import type { Solve } from '@/features/timer/SolveHistory';
import { generateScramble } from '@/lib/scramble';
import { authenticatedFetch } from '@/lib/api';
import Loading from '@/components/Loading';
import { calculateAO5, calculateAO12 } from '@/lib/stats';

const Timer = () => {
    const [currentScramble, setCurrentScramble] = useState(generateScramble());
    const [solves, setSolves] = useState<Solve[]>([]);
    const [isTiming, setIsTiming] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    // Load solves and stats from backend on mount
    const fetchData = useCallback(async () => {
        try {
            const [solvesData, statsData] = await Promise.all([
                authenticatedFetch('/solve'),
                authenticatedFetch('/stats')
            ]);

            const formattedSolves = solvesData.map((s: any) => ({
                id: s.id.toString(),
                time: s.time * 1000,
                scramble: s.scramble,
                timestamp: new Date(s.createdAt).getTime()
            })).reverse();

            setSolves(formattedSolves);
            setStats(statsData);
        } catch (e) {
            console.error('Failed to fetch data from backend', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSolveComplete = useCallback(async (timeMs: number) => {
        const timeSec = timeMs / 1000;

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
            const result = await authenticatedFetch('/solve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    time: timeSec,
                    cube_type: '3x3', // Backend uses '3x3'
                    scramble: currentScramble,
                    dnf: false
                })
            });

            // Update tempId with real ID from backend
            setSolves(prev => prev.map(s => s.id === tempId ? {
                ...s,
                id: result.id.toString()
            } : s));

            // Refresh stats
            const statsData = await authenticatedFetch('/stats');
            setStats(statsData);
        } catch (e) {
            console.error('Failed to save solve to backend', e);
        }
    }, [currentScramble]);

    const handleDeleteSolve = useCallback(async (id: string) => {
        // Optimistic delete
        const originalSolves = [...solves];
        setSolves(prev => prev.filter(s => s.id !== id));

        try {
            await authenticatedFetch(`/solve/${id}`, {
                method: 'DELETE'
            });
            // Refresh stats
            const statsData = await authenticatedFetch('/stats');
            setStats(statsData);
        } catch (e) {
            console.error('Failed to delete solve from backend', e);
            setSolves(originalSolves); // Rollback
        }
    }, [solves]);

    const handleStart = useCallback(() => setIsTiming(true), []);
    const handleStop = useCallback(() => setIsTiming(false), []);

    if (isLoading) {
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
                        stats={stats}
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
