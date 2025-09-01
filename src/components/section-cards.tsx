"use client";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Solve } from "@/lib/types/SolveTypes"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardsProps {
  solves: Solve[]
}

export function SectionCards({ solves }: SectionCardsProps) {
  const [averageTime, setAverageTime] = useState<string>("0.00s")
  const [bestTime, setBestTime] = useState<string>("Do some solves!");
  const [totalSolves, setTotalSolves] = useState<string>("0");
  const [trend, setTrend] = useState<"up" | "down" | "neutral">("neutral")

  // Function to convert centiseconds to formatted time string
  const formatTime = (centiseconds: number): string => {
    const seconds = centiseconds / 100
    return `${seconds.toFixed(2)}s`
  }

  // Function to compute average of valid solves (excluding DNFs)
  const computeAverage = (solves: Solve[]): [number, number] => {
    const validSolves = solves.filter(solve => !solve.dnf)
    
    if (validSolves.length === 0) return [0, 0];
    
    const totalTime = validSolves.reduce((sum, solve) => {
      // Apply +2 penalty if applicable
      const timeWithPenalty = solve.plusTwo ? solve.time + 200 : solve.time
      return sum + timeWithPenalty
    }, 0)
    
    return [totalTime / validSolves.length, validSolves.length]
  }

  const computeBestTime = (solves: Solve[]): number => {
    const validSolves = solves.filter(solve => !solve.dnf)

    if (validSolves.length === 0) return 0;

    let minSolve = 100000000;
    for (let i = 0; i < validSolves.length; i++) {
      if (validSolves[i].time < minSolve) minSolve = validSolves[i].time
    }

    return minSolve;
  }

  useEffect(() => {
    if (solves.length > 0) {
      const avgCentiseconds = computeAverage(solves)
      const newBestTime = computeBestTime(solves);
      setBestTime(formatTime(newBestTime));
      setAverageTime(formatTime(avgCentiseconds[0]))
      setTotalSolves(avgCentiseconds[1].toString())
      
      // Simple trend calculation (you can enhance this with more complex logic)
      // For now, just set a neutral trend
      setTrend("neutral")
    } else {
      setAverageTime("0.00s")
      setTrend("neutral")
    }
  }, [solves])

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>3x3 Average Time</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {averageTime}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {trend === "up" && <IconTrendingUp />}
              {trend === "down" && <IconTrendingDown />}
              {solves.length > 0 ? `${solves.length} solves` : "No data"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {solves.length > 0 ? (
              <>
                {solves.filter(s => !s.dnf).length} valid solves
                {trend === "up" && <IconTrendingUp className="size-4" />}
                {trend === "down" && <IconTrendingDown className="size-4" />}
              </>
            ) : (
              "No solves recorded yet"
            )}
          </div>
          <div className="text-muted-foreground">
            {solves.length > 0 ? `Based on ${solves.length} total attempts` : "Start timing to see data"}
          </div>
        </CardFooter>
      </Card>
      {/* Other cards remain the same for now */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Best Time</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {bestTime}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Down 20% this period <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Acquisition needs attention
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Solves</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalSolves}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card>
    </div>
  )
}
