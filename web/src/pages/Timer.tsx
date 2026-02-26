import { useState, useCallback, useEffect } from 'react';
import ScrambleDisplay from '@/features/timer/ScrambleDisplay';
import TimerDisplay from '@/features/timer/TimerDisplay';
import StatsDisplay from '@/features/timer/StatsDisplay';
import SolveHistory from '@/features/timer/SolveHistory';
import type { Solve } from '@/features/timer/SolveHistory';
import { generateScramble } from '@/lib/scramble';
import { authenticatedFetch } from '@/lib/api';

const Timer = () => {
    const [currentScramble, setCurrentScramble] = useState(generateScramble());
    const [solves, setSolves] = useState<Solve[]>([]);
    const [isTiming, setIsTiming] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load solves from backend on mount
    useEffect(() => {
        const fetchSolves = async () => {
            try {
                const data = await authenticatedFetch('/solve');
                // Backend might return items sorted by createdAt
                const formattedSolves = data.map((s: any) => ({
                    id: s.id.toString(),
                    time: s.time * 1000, // Backend stores in seconds? Let's check.
                    scramble: s.scramble,
                    timestamp: new Date(s.createdAt).getTime()
                })).reverse(); // Newest first
                setSolves(formattedSolves);
            } catch (e) {
                console.error('Failed to fetch solves from backend', e);
                // Fallback to local storage if needed, or just show empty
            } finally {
                setIsLoading(false);
            }
        };

        fetchSolves();
    }, []);

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
                    cube_type: '3x3x3',
                    scramble: currentScramble,
                    dnf: false
                })
            });

            // Update tempId with real ID from backend
            setSolves(prev => prev.map(s => s.id === tempId ? {
                ...s,
                id: result.id.toString()
            } : s));
        } catch (e) {
            console.error('Failed to save solve to backend', e);
            // Optionally notify user or handle retry
        }
    }, [currentScramble]);

    const handleDeleteSolve = useCallback(async (id: string) => {
        // Backend doesn't seem to have a delete endpoint yet in solve.py
        // We'll just update local state for now, but in a real app we'd call DELETE /solve/:id
        setSolves(prev => prev.filter(s => s.id !== id));
    }, []);

    const handleStart = useCallback(() => setIsTiming(true), []);
    const handleStop = useCallback(() => setIsTiming(false), []);

    if (isLoading) {
        return (
            <div className="min-h-full flex items-center justify-center">
                <div className="text-foreground/20 font-serif text-2xl animate-pulse">Algobase</div>
            </div>
        );
    }

    return (
        <div className="min-h-full py-12 px-6 flex flex-col items-center">
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
                    <StatsDisplay solves={solves.map(s => s.time)} />
                    <SolveHistory solves={solves} onDeleteSolve={handleDeleteSolve} />
                </div>
            </div>
        </div>
    );
};

export default Timer;
