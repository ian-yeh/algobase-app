"use client";
import React, { useState, useEffect, useCallback } from 'react';

interface TimerMainProps {
  onSolveComplete: () => void;
  currentScramble: string;
  userId: string;
}

const TimerMain = ({ onSolveComplete, currentScramble, userId }: TimerMainProps) => {
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [pressStartTime, setPressStartTime] = useState<number | null>(null);
  const [currentColor, setCurrentColor] = useState('text-foreground');
  const [timerStart, setTimerStart] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [time, setTime] = useState(0.00);

  const handleKeyDown = useCallback(async (event: KeyboardEvent) => {
    if (event.code === 'Space' && !isSpacePressed) {
      event.preventDefault();
      
      if (timerStart) {
        const roundedTime = Math.round(time * 100) / 100;
        console.log(roundedTime, currentScramble)
        setTimerStart(false);
        setTimerStartTime(null);
        setCurrentColor('text-foreground');

        onSolveComplete();

        const response = await fetch('/api/user/saveSolve', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            time: roundedTime,
            scramble: currentScramble,
            dnf: false,
            plusTwo: false
          })
        })

        const data = await response.json();
        console.log(data)

        return;
      }

      
      setIsSpacePressed(true);
      setPressStartTime(Date.now());
      setCurrentColor('text-red-500'); // initial hold color
    }
  }, [isSpacePressed, timerStart, time, currentScramble, onSolveComplete, userId]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space' && isSpacePressed) {
      event.preventDefault();
      
      const heldTime = pressStartTime ? Date.now() - pressStartTime : 0;
      
      if (heldTime >= 500) {
        // Start the timer only if held for 500ms+
        setTimerStart(true);
        setTimerStartTime(Date.now());
        setTime(0.00);
        setCurrentColor('text-foreground');
      } else {
        // Reset if not held long enough
        setCurrentColor('text-foreground');
      }
      
      setIsSpacePressed(false);
      setPressStartTime(null);
    }
  }, [isSpacePressed, pressStartTime]);

  // Handle space bar hold color change
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSpacePressed && pressStartTime) {
      interval = setInterval(() => {
        const heldTime = Date.now() - pressStartTime;
        if (heldTime >= 500) {
          setCurrentColor('text-green-500');
        } else {
          setCurrentColor('text-red-500');
        }
      }, 10); 
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpacePressed, pressStartTime]);

  // Handle timer updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerStart && timerStartTime) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - timerStartTime) / 1000;
        setTime(elapsed);
      }, 10); // Update every 10ms for smooth display
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStart, timerStartTime]);

  // Event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const formatTime = (seconds: number): string => {
    return seconds.toFixed(2);
  };

  return (
    <div className="w-full md:w-12xl p-8">
      <div className="flex flex-col justify-center items-center">
        <h1 className={`text-[200px] transition-colors duration-300 ${currentColor}`}>
          {formatTime(time)}
        </h1>
        <div className="mt-8 text-center text-muted-foreground">
          <p className="text-lg">
            {!timerStart && !isSpacePressed && "Hold SPACE for 0.5s to start timer"}
            {isSpacePressed && currentColor === 'text-red-500' && "Keep holding..."}
            {isSpacePressed && currentColor === 'text-green-500' && "Release to start!"}
            {timerStart && "Press SPACE to stop"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimerMain;
