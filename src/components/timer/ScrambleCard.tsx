import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TimerDisplay } from './TimerDisplay';

interface ScrambleCardProps {
  scramble: string;
  canGoPrev: boolean;
  onPrevScramble: () => void;
  onNextScramble: () => void;
  onNewSession: () => void;
  inspectionEnabled: boolean;
  onToggleInspection: () => void;
  onRestartInspection: () => void;
  onStartStop: () => void;
  // Timer display props
  elapsed: number;
  isRunning: boolean;
  isPrimed: boolean;
  inspectionLeft: number;
  isInspecting: boolean;
}

export const ScrambleCard = ({
  scramble,
  canGoPrev,
  onPrevScramble,
  onNextScramble,
  onNewSession,
  inspectionEnabled,
  onToggleInspection,
  onRestartInspection,
  onStartStop,
  elapsed,
  isRunning,
  isPrimed,
  inspectionLeft,
  isInspecting
}: ScrambleCardProps) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Scramble</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onToggleInspection}>
              {inspectionEnabled ? "Inspection: On" : "Inspection: Off"}
            </Button>
            <Button variant="outline" size="sm" onClick={onNewSession}>
              New Session
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          <div className="text-base sm:text-lg font-mono select-text">{scramble}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onPrevScramble} disabled={!canGoPrev}>
              Prev
            </Button>
            <Button variant="outline" size="sm" onClick={onNextScramble}>
              Next
            </Button>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="flex flex-col items-center justify-center py-8">
          <TimerDisplay
            elapsed={elapsed}
            isRunning={isRunning}
            isPrimed={isPrimed}
            inspectionLeft={inspectionLeft}
            isInspecting={isInspecting}
            inspectionEnabled={inspectionEnabled}
          />
          <div className="mt-4 flex items-center gap-2">
            <Button 
              variant="secondary" 
              onClick={onRestartInspection} 
              disabled={!inspectionEnabled || isRunning}
            >
              Restart Inspection
            </Button>
            <Button variant="outline" onClick={onStartStop}>
              {isRunning ? "Stop" : "Start"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};