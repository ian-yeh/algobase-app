import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Solve, formatTime } from '@/lib/timer/utils';

interface HistoryCardProps {
  solves: Solve[];
  onUpdatePenalty: (id: string, penalty: 'OK' | '+2' | 'DNF') => void;
}

export const HistoryCard = ({ solves, onUpdatePenalty }: HistoryCardProps) => {
  if (solves.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>History (0)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No solves yet.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>History ({solves.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-80 overflow-auto">
          <ol className="text-sm space-y-1">
            {solves.slice().reverse().map((s, idx) => (
              <li key={s.id} className="flex items-start justify-between gap-4 py-1">
                <div className="flex-1">
                  <div className="font-mono">
                    #{solves.length - idx}: {formatTime(s.timeMs, s.penalty)}
                  </div>
                  <div className="text-xs text-muted-foreground break-words">{s.scramble}</div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <Button 
                    variant={s.penalty === "+2" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => onUpdatePenalty(s.id, s.penalty === "+2" ? "OK" : "+2")}
                  >
                    +2
                  </Button>
                  <Button 
                    variant={s.penalty === "DNF" ? "destructive" : "outline"} 
                    size="sm" 
                    onClick={() => onUpdatePenalty(s.id, s.penalty === "DNF" ? "OK" : "DNF")}
                  >
                    DNF
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};