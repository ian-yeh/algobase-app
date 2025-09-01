"use client";
import { useScramble } from "@/hooks/use-scramble";
import { ScrambleCard } from "@/components/timer/ScrambleCard";
import TimerMain from "@/components/timer/TimerMain";

interface TimerProps {
  userId: string,
}

const Timer = ({userId}: TimerProps) => {
  const { currentScramble, scrambleIndex, nextScramble, prevScramble, newSession } = useScramble();

  return (
    <main className="flex flex-col p-4 sm:p-8">
      <section className="flex flex-col justify-center">

        <ScrambleCard
          scramble={currentScramble}
          canGoPrev={scrambleIndex > 0}
          onPrevScramble={prevScramble}
          onNextScramble={nextScramble}
          onNewSession={newSession}
          inspectionEnabled={true}
          onToggleInspection={() => {}}
        />

        <TimerMain 
          onSolveComplete={nextScramble}
          currentScramble={currentScramble}
          userId={userId}
        />

      </section>
    </main>
  );
};

export default Timer;
