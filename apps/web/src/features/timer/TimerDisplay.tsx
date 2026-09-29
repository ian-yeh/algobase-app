import { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import { formatTime } from '@/lib/stats';

interface TimerDisplayProps {
    onSolveComplete: (time: number) => void;
    onStart?: () => void;
    onStop?: () => void;
    disabled?: boolean;
}

type TimerState = 'IDLE' | 'HOLDING' | 'READY' | 'RUNNING';

const TimerDisplay: React.FC<TimerDisplayProps> = ({ onSolveComplete, onStart, onStop, disabled }) => {
    const [time, setTime] = useState(0);
    const [displayState, setDisplayState] = useState<TimerState>('IDLE');

    // Logical state tracking
    const stateRef = useRef<TimerState>('IDLE');
    const startTimeRef = useRef<number>(0);
    const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const frameRef = useRef<number | null>(null);
    const disabledRef = useRef(disabled);

    // Sync props to refs to avoid re-running the effect when callbacks change
    const callbacks = useRef({ onSolveComplete, onStart, onStop });
    useEffect(() => {
        callbacks.current = { onSolveComplete, onStart, onStop };
    }, [onSolveComplete, onStart, onStop]);

    useEffect(() => {
        disabledRef.current = disabled;
    }, [disabled]);

    const updateState = useCallback((newState: TimerState) => {
        stateRef.current = newState;
        setDisplayState(newState);
    }, []);

    const startTimer = useCallback(() => {
        startTimeRef.current = performance.now();
        updateState('RUNNING');
        startTransition(() => callbacks.current.onStart?.());

        const tick = () => {
            setTime(performance.now() - startTimeRef.current);
            frameRef.current = requestAnimationFrame(tick);
        };
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(tick);
    }, [updateState]);

    // stoppedAt is the event's timeStamp, so handler latency never counts toward the solve
    const stopTimer = useCallback((stoppedAt: number) => {
        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
        }

        const finalTime = stoppedAt - startTimeRef.current;
        startTimeRef.current = 0;
        setTime(finalTime);
        updateState('IDLE');
        // Parent updates (history, stats, layout) are low priority so the final time paints first
        startTransition(() => {
            callbacks.current.onStop?.();
            callbacks.current.onSolveComplete(finalTime);
        });
    }, [updateState]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // If any key is pressed while running, stop (even when disabled — safety)
            if (stateRef.current === 'RUNNING') {
                e.preventDefault();
                stopTimer(e.timeStamp);
                return;
            }

            if (disabledRef.current) return;
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
            if (disabledRef.current) return;
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
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [startTimer, stopTimer, updateState]);

    // Touch handlers mirror the space-bar hold/release behavior for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        if (stateRef.current === 'RUNNING') {
            stopTimer(e.timeStamp);
            return;
        }
        if (disabledRef.current) return;
        if (stateRef.current === 'IDLE' && !holdTimeoutRef.current) {
            updateState('HOLDING');
            holdTimeoutRef.current = setTimeout(() => {
                if (stateRef.current === 'HOLDING') {
                    updateState('READY');
                }
            }, 350);
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        e.preventDefault();
        if (disabledRef.current) return;
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

    const getTimerColor = () => {
        switch (displayState) {
            case 'HOLDING': return 'text-red-500';
            case 'READY': return 'text-green-500';
            case 'RUNNING': return 'text-foreground';
            default: return 'text-foreground';
        }
    };

    return (
        <div
            className={`absolute inset-0 2xl:pl-96 flex flex-col items-center justify-center gap-4 md:gap-5 select-none touch-none cursor-pointer ${displayState === 'RUNNING' ? 'z-20' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div className={`text-8xl sm:text-9xl md:text-[160px] lg:text-[224px] leading-none font-sans tabular-nums transition-colors duration-100 ${getTimerColor()}`}>
                {formatTime(time)}
            </div>
            <div className="text-foreground/60 text-sm font-medium h-5 text-center px-4">
                {displayState === 'IDLE' && 'Hold to start'}
                {displayState === 'HOLDING' && 'Wait for green...'}
                {displayState === 'READY' && 'Release to start!'}
                {displayState === 'RUNNING' && 'Tap or press a key to stop'}
            </div>
        </div>
    );
};

export default TimerDisplay;
