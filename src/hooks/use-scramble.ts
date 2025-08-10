import { useState } from 'react';
import { generateScramble } from '@/lib/timer/utils';

export const useScramble = () => {
  const [currentScrambles, setCurrentScrambles] = useState<string[]>(() => [generateScramble()]);
  const [scrambleIndex, setScrambleIndex] = useState(0);

  const currentScramble = currentScrambles[scrambleIndex] ?? "";

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
    newSession
  };
};
