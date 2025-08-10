import { formatTime } from '@/lib/timer/utils';

interface TimerDisplayProps {
  elapsed: number;
  isRunning: boolean;
  isPrimed: boolean;
  inspectionLeft: number;
  isInspecting: boolean;
  inspectionEnabled: boolean;
}

export const TimerDisplay = ({ 
  elapsed, 
  isRunning, 
  isPrimed, 
  inspectionLeft, 
  isInspecting, 
  inspectionEnabled 
}: TimerDisplayProps) => {
  const timerColor = isRunning ? "text-foreground" : isPrimed ? "text-primary" : "text-foreground";
  const currentDisplay = isRunning ? elapsed : 0;

  if (inspectionEnabled && isInspecting && !isRunning) {
    return (
      <div className="text-center">
        <div className="text-sm text-muted-foreground mb-2">Inspection</div>
        <div className="font-mono text-5xl sm:text-6xl">{Math.ceil(inspectionLeft / 1000)}</div>
        <div className="text-xs text-muted-foreground mt-2">Warnings at 8s and 12s</div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className={`font-mono ${timerColor} text-6xl sm:text-7xl md:text-8xl select-none`}>
        {formatTime(currentDisplay)}
      </div>
      <div className="mt-3 text-sm text-muted-foreground">
        Hold Space to prime, release to start. Press Space to stop.
      </div>
    </div>
  );
};