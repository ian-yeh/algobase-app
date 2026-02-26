import { useState, useEffect, useRef } from 'react';

interface TimerDisplayProps {
    onSolveComplete: (time: number) => void;
    onStart?: () => void;
    onStop?: () => void;
}

type TimerState = 'IDLE' | 'HOLDING' | 'READY' | 'RUNNING';

const TimerDisplay: React.FC<TimerDisplayProps> = ({ onSolveComplete, onStart, onStop }) => {
    const [time, setTime] = useState(0);
    const [displayState, setDisplayState] = useState<TimerState>('IDLE');

    // Logical state tracking
    const stateRef = useRef<TimerState>('IDLE');
    const startTimeRef = useRef<number>(0);
    const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Sync props to refs to avoid re-running the effect when callbacks change
    const callbacks = useRef({ onSolveComplete, onStart, onStop });
    useEffect(() => {
        callbacks.current = { onSolveComplete, onStart, onStop };
    }, [onSolveComplete, onStart, onStop]);

    const updateState = (newState: TimerState) => {
        stateRef.current = newState;
        setDisplayState(newState);
    };

    const startTimer = () => {
        startTimeRef.current = Date.now();
        updateState('RUNNING');
        callbacks.current.onStart?.();

        // Ticking loop
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setTime(Date.now() - startTimeRef.current);
        }, 10);
    };

    const stopTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        const finalTime = Date.now() - startTimeRef.current;
        startTimeRef.current = 0;
        setTime(finalTime);
        updateState('IDLE');
        callbacks.current.onStop?.();
        callbacks.current.onSolveComplete(finalTime);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // If any key is pressed while running, stop
            if (stateRef.current === 'RUNNING') {
                e.preventDefault();
                stopTimer();
                return;
            }

            if (e.code !== 'Space') return;
            e.preventDefault();

            if (stateRef.current === 'IDLE' && !holdTimeoutRef.current) {
                updateState('HOLDING');
                holdTimeoutRef.current = setTimeout(() => {
                    if (stateRef.current === 'HOLDING') {
                        updateState('READY');
                    }
                }, 350);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code !== 'Space') return;
            e.preventDefault();

            if (holdTimeoutRef.current) {
                clearTimeout(holdTimeoutRef.current);
                holdTimeoutRef.current = null;
            }

            if (stateRef.current === 'READY') {
                startTimer();
            } else if (stateRef.current === 'HOLDING') {
                updateState('IDLE');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []); // Only run once on mount

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10);
        return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        switch (displayState) {
            case 'HOLDING': return 'text-red-500';
            case 'READY': return 'text-green-500';
            case 'RUNNING': return 'text-foreground font-medium';
            default: return 'text-foreground';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-20 select-none">
            <div className={`text-8xl md:text-9xl font-sans tabular-nums transition-colors duration-100 ${getTimerColor()}`}>
                {formatTime(time)}
            </div>
            <div className="mt-8 text-foreground/40 text-sm font-medium h-6">
                {displayState === 'IDLE' && 'Hold SPACE to start'}
                {displayState === 'HOLDING' && 'Wait for green...'}
                {displayState === 'READY' && 'Release to start!'}
                {displayState === 'RUNNING' && 'Press any key to stop'}
            </div>
        </div>
    );
};

export default TimerDisplay;
