import { useState, useEffect, useMemo } from 'react';
import { Solve, Penalty } from '@/lib/timer/utils';

const STORAGE_KEY = "algobase_session_v1";

export const useSolves = () => {
  const [solves, setSolves] = useState<Solve[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Solve[];
    } catch {}
    return [];
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(solves));
    } catch {}
  }, [solves]);

  const addSolve = (solve: Solve) => {
    setSolves(prev => [...prev, solve]);
  };

  const updateSolvePenalty = (id: string, penalty: Penalty) => {
    setSolves(prev => prev.map(s => s.id === id ? { ...s, penalty } : s));
  };

  const resetSolves = () => setSolves([]);

  return {
    solves,
    addSolve,
    updateSolvePenalty,
    resetSolves,
    setSolves
  };
};