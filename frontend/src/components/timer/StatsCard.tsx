import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Solve, formatTime, computeAverage } from '@/lib/timer/utils';

interface StatsCardProps {
  solves: Solve[];
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
}

export const StatsCard = ({ solves, onExport, onImport, onReset }: StatsCardProps) => {
  const stats = useMemo(() => {
    const applyPenalty = (s: Solve) => {
      if (s.penalty === "DNF") return null;
      return s.timeMs + (s.penalty === "+2" ? 2000 : 0);
    };

    const valids = solves.map(applyPenalty).filter((v): v is number => v !== null);
    const lastSolve = solves[solves.length - 1];
    const ao5 = computeAverage(solves, 5);
    const ao12 = computeAverage(solves, 12);
    
    const sessionMean = valids.length === 0 ? "-" : 
      formatTime(Math.round(valids.reduce((a, b) => a + b, 0) / valids.length));
    
    const best = valids.length === 0 ? "-" : formatTime(Math.min(...valids));
    const worst = valids.length === 0 ? "-" : formatTime(Math.max(...valids));

    return { lastSolve, ao5, ao12, sessionMean, best, worst };
  }, [solves]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Last</span>
          <span className="font-mono">
            {stats.lastSolve ? formatTime(stats.lastSolve.timeMs, stats.lastSolve.penalty) : "-"}
          </span>
        </div>
        <div className="flex justify-between text-sm"><span>ao5</span><span className="font-mono">{stats.ao5.value}</span></div>
        <div className="flex justify-between text-sm"><span>ao12</span><span className="font-mono">{stats.ao12.value}</span></div>
        <div className="flex justify-between text-sm"><span>Mean</span><span className="font-mono">{stats.sessionMean}</span></div>
        <div className="flex justify-between text-sm"><span>Best</span><span className="font-mono">{stats.best}</span></div>
        <div className="flex justify-between text-sm"><span>Worst</span><span className="font-mono">{stats.worst}</span></div>
        <Separator className="my-2" />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExport}>Export</Button>
          <Button variant="outline" size="sm" onClick={onImport}>Import</Button>
          <Button variant="destructive" size="sm" onClick={onReset}>Reset</Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Shortcuts: Space (start/stop), + (toggle +2), Delete (toggle DNF)
        </div>
      </CardContent>
    </Card>
  );
};