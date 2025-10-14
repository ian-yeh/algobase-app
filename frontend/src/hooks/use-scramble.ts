import { useState, useEffect } from 'react';
import { generateScramble } from '@/lib/timer/utils';

export const useScramble = () => {
  const [currentScrambles, setCurrentScrambles] = useState<string[]>([]);
  const [scrambleIndex, setScrambleIndex] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setCurrentScrambles([generateScramble()]);
    setIsHydrated(true);
  }, []);
  
  const currentScramble = isHydrated ? (currentScrambles[scrambleIndex] ?? "") : "";
  
  const nextScramble = () => {
    if (scrambleIndex === currentScrambles.length - 1) {
      setCurrentScrambles(s => [...s, generateScramble()]);
    }
    setScrambleIndex(i => i + 1);
  };
  
  const prevScramble = () => {
    if (scrambleIndex > 0) setScrambleIndex(i => i - 1);
  };
  
  const newSession = () => {
    setCurrentScrambles([generateScramble()]);
    setScrambleIndex(0);
  };
  
  return {
    currentScramble,
    scrambleIndex,
    totalScrambles: currentScrambles.length,
    nextScramble,
    prevScramble,
    newSession,
    isHydrated
  };
};
