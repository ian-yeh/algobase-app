"use client";
import { useRef } from "react";
import { useTimer } from "@/hooks/use-timer";
import { useInspection } from "@/hooks/use-inspection";
import { useSolves } from "@/hooks/use-solves";
import { useScramble } from "@/hooks/use-scramble";
import { useKeyboardControls } from "@/hooks/use-keyboard-controls";
import { ScrambleCard } from "@/components/timer/ScrambleCard";
import { TimerMain } from "@/components/timer/TimerMain";
import { StatsCard } from "@/components/timer/StatsCard";
import { HistoryCard } from "@/components/timer/HistoryCard";
import { exportData, importData } from "@/lib/timer/dataHandlers";
import { uid, Solve } from "@/lib/timer/utils";

const Timer = () => {
  const { solves, addSolve, updateSolvePenalty, resetSolves, setSolves } = useSolves();
  const { currentScramble, scrambleIndex, nextScramble, prevScramble, newSession } = useScramble();
  const { isRunning, elapsed, isPrimed, isHolding, startTimer, stopTimer, setIsHolding, setIsPrimed, holdTimer } = useTimer();
  const { isInspecting, inspectLeft, setIsInspecting } = useInspection(true, currentScramble, isRunning);
  
  const importRef = useRef<HTMLInputElement | null>(null);

  const handleStartHold = () => {
    setIsHolding(true);
    holdTimer.current = window.setTimeout(() => setIsPrimed(true), 250);
  };

  const handleStopHold = () => {
    setIsHolding(false);
    setIsPrimed(false);
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const handleStart = () => {
    setIsInspecting(false);
    startTimer();
  };

  const handleStop = () => {
    const finalTime = stopTimer();
    const newSolve: Solve = {
      id: uid(),
      timeMs: Math.round(finalTime),
      penalty: "OK",
      scramble: currentScramble,
      date: new Date().toISOString(),
    };
    addSolve(newSolve);
    nextScramble();
  };

  const handleImport = async () => {
    importRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedSolves = await importData(file);
      setSolves(importedSolves);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  useKeyboardControls({
    isRunning,
    isPrimed,
    isHolding,
    onStartHold: handleStartHold,
    onStopHold: handleStopHold,
    onStart: handleStart,
    onStop: handleStop,
    onTogglePlus2: () => updateSolvePenalty(solves[solves.length - 1]?.id, solves[solves.length - 1]?.penalty === "+2" ? "OK" : "+2"),
    onToggleDNF: () => updateSolvePenalty(solves[solves.length - 1]?.id, solves[solves.length - 1]?.penalty === "DNF" ? "OK" : "DNF")
  });

  return (
    <main className="mx-auto w-8xl p-4 sm:p-8">
      <section className="flex flex-col gap-6 justify-center">
        <ScrambleCard
          scramble={currentScramble}
          canGoPrev={scrambleIndex > 0}
          onPrevScramble={prevScramble}
          onNextScramble={nextScramble}
          onNewSession={newSession}
          inspectionEnabled={true}
          onToggleInspection={() => {}} // You'll need to add this state
        />

        <TimerMain
          elapsed={elapsed}
          isRunning={isRunning}
          isPrimed={isPrimed}
          inspectionLeft={inspectLeft}
          isInspecting={isInspecting}
          inspectionEnabled={true}
          onRestartInspection={() => setIsInspecting(true)}
          onStartStop={isRunning ? handleStop : handleStart}
        />
      </section>

      {/*
      <section className="mt-6">
        <StatsCard
          solves={solves}
          onExport={() => exportData(solves)}
          onImport={handleImport}
          onReset={resetSolves}
        />
      </section>

      <section className="mt-6">
        <HistoryCard
          solves={solves}
          onUpdatePenalty={updateSolvePenalty}
        />
      </section>
      */}

      <input 
        ref={importRef} 
        type="file" 
        accept="application/json" 
        className="hidden" 
        onChange={handleFileImport}
      />
    </main>
  );
};

export default Timer;