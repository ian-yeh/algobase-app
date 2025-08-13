import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TimerDisplay } from "./TimerDisplay";

interface TimerMainProps {
  elapsed: number;
  isRunning: boolean;
  isPrimed: boolean;
  inspectionLeft: number;
  isInspecting: boolean;
  inspectionEnabled: boolean;
  onRestartInspection: () => void;
  onStartStop: () => void;
}

export const TimerMain = ({
  elapsed,
  isRunning,
  isPrimed,
  inspectionLeft,
  isInspecting,
  inspectionEnabled,
  onRestartInspection,
  onStartStop,
}: TimerMainProps) => {
  return (
    <Card className="w-full md:w-[450px]">
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
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