import React, { useState, useEffect, useCallback } from 'react';

const TimerMain = () => {
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [pressStartTime, setPressStartTime] = useState<number | null>(null);
  const [currentColor, setCurrentColor] = useState('text-white');

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space' && !isSpacePressed) {
      setIsSpacePressed(true);
      setPressStartTime(Date.now());
      setCurrentColor('text-red-500'); // initial hold color
    }
  }, [isSpacePressed]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space' && isSpacePressed) {
      setIsSpacePressed(false);
      setPressStartTime(null);
      setCurrentColor('text-white'); // reset on release
    }
  }, [isSpacePressed]);

  // Watch press duration while holding
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
      }, 100); // check every 100ms
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpacePressed, pressStartTime]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div className="w-full md:w-12xl p-8">
      <div className="flex flex-col justify-center items-center">
        <h1 className={`text-[200px] transition-colors duration-300 ${currentColor}`}>
          0.00
        </h1>
      </div>
    </div>
  );
};

export default TimerMain;
