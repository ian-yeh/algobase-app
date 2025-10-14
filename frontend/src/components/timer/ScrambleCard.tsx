"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ScrambleCardProps {
  scramble: string;
  canGoPrev: boolean;
  onPrevScramble: () => void;
  onNextScramble: () => void;
  onNewSession: () => void;
  inspectionEnabled: boolean;
  onToggleInspection: () => void;
}

export const ScrambleCard = ({
  scramble,
  canGoPrev,
  onPrevScramble,
  onNextScramble,
  onNewSession,
  inspectionEnabled,
  onToggleInspection,
}: ScrambleCardProps) => {

  return (
    <Card className="w-full md:w-12xl">
      {/* Header */}
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
      {/* Content */}
      <CardContent>
        {/* Scramble text + controls */}
        <div className="flex flex-col gap-4">
          <div className="text-center text-lg sm:text-xl md:text-3xl font-mono select-text break-words">
            {scramble}
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevScramble}
              disabled={!canGoPrev}
            >
              Prev
            </Button>
            <Button variant="outline" size="sm" onClick={onNextScramble}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
