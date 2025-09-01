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

type Trend = "up" | "down" | "neutral"

export function SectionCards({ solves }: SectionCardsProps) {
  const [averageTime, setAverageTime] = useState<string>("0.00s")
  const [bestAo5, setBestAo5] = useState<string>("N/A")
  const [bestAo12, setBestAo12] = useState<string>("N/A")
  const [consistency, setConsistency] = useState<string>("N/A")

  const [trendAvg, setTrendAvg] = useState<Trend>("neutral")
  const [trendAo5, setTrendAo5] = useState<Trend>("neutral")
  const [trendAo12, setTrendAo12] = useState<Trend>("neutral")
  const [trendConsistency, setTrendConsistency] = useState<Trend>("neutral")

  // Format centiseconds into seconds string
  const formatTime = (centiseconds: number): string => {
    const seconds = centiseconds / 100
    return `${seconds.toFixed(2)}s`
  }

  // Apply penalties and filter DNFs
  const getValidTimes = (solves: Solve[]) =>
    solves
      .filter((s) => !s.dnf)
      .map((s) => (s.plusTwo ? s.time + 200 : s.time))

  // Average of all solves
  const computeAverage = (times: number[]) => {
    if (times.length === 0) return 0
    return times.reduce((a, b) => a + b, 0) / times.length
  }

  // Average of N (e.g. ao5, ao12)
  const computeAverageN = (solves: Solve[], n: number): number => {
    if (solves.length < n) return 0
    const recent = solves.slice(-n)
    const times = getValidTimes(recent)
    if (times.length < n) return 0

    const sorted = [...times].sort((a, b) => a - b)
    if (n >= 5) {
      sorted.shift() // remove fastest
      sorted.pop()   // remove slowest
    }
    return computeAverage(sorted)
  }

  // Best aoN over all solves
  const computeBestAoN = (solves: Solve[], n: number): number => {
    if (solves.length < n) return 0
    let best = Infinity
    for (let i = 0; i <= solves.length - n; i++) {
      const avg = computeAverageN(solves.slice(i, i + n), n)
      if (avg > 0 && avg < best) best = avg
    }
    return best === Infinity ? 0 : best
  }

  // Consistency = standard deviation
  const computeStdDev = (times: number[]): number => {
    if (times.length === 0) return 0
    const mean = computeAverage(times)
    const variance =
      times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / times.length
    return Math.sqrt(variance)
  }

  // Trend helper
  const computeTrend = (current: number, previous: number): Trend => {
    if (previous === 0) return "neutral"
    if (current < previous) return "down" // faster is good
    if (current > previous) return "up"
    return "neutral"
  }

  useEffect(() => {
    const times = getValidTimes(solves)

    if (solves.length > 0) {
      // Overall average
      const avg = computeAverage(times)
      setAverageTime(formatTime(avg))
      const prevAvg = computeAverage(getValidTimes(solves.slice(0, -5)))
      setTrendAvg(computeTrend(avg, prevAvg))

      // Best ao5
      const best5 = computeBestAoN(solves, 5)
      setBestAo5(best5 > 0 ? formatTime(best5) : "N/A")
      const prevAo5 = computeBestAoN(solves.slice(0, -5), 5)
      setTrendAo5(computeTrend(best5, prevAo5))

      // Best ao12
      const best12 = computeBestAoN(solves, 12)
      setBestAo12(best12 > 0 ? formatTime(best12) : "N/A")
      const prevAo12 = computeBestAoN(solves.slice(0, -12), 12)
      setTrendAo12(computeTrend(best12, prevAo12))

      // Consistency (std dev)
      const std = computeStdDev(times)
      setConsistency(formatTime(std))
      const prevStd = computeStdDev(getValidTimes(solves.slice(0, -20)))
      setTrendConsistency(computeTrend(std, prevStd))
    } else {
      setAverageTime("0.00s")
      setBestAo5("N/A")
      setBestAo12("N/A")
      setConsistency("N/A")
      setTrendAvg("neutral")
      setTrendAo5("neutral")
      setTrendAo12("neutral")
      setTrendConsistency("neutral")
    }
  }, [solves, computeBestAoN, computeStdDev])

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Overall Average */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Overall Average</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {averageTime}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {trendAvg === "up" && <IconTrendingUp />}
              {trendAvg === "down" && <IconTrendingDown />}
              {solves.length} solves
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          Based on all valid solves
        </CardFooter>
      </Card>

      {/* Best ao5 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Best ao5</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {bestAo5}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {trendAo5 === "up" && <IconTrendingUp />}
              {trendAo5 === "down" && <IconTrendingDown />}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          Best rolling average of 5
        </CardFooter>
      </Card>

      {/* Best ao12 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Best ao12</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {bestAo12}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {trendAo12 === "up" && <IconTrendingUp />}
              {trendAo12 === "down" && <IconTrendingDown />}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          Best rolling average of 12
        </CardFooter>
      </Card>

      {/* Consistency */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Consistency</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {consistency}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {trendConsistency === "up" && <IconTrendingUp />}
              {trendConsistency === "down" && <IconTrendingDown />}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          Standard deviation of solve times
        </CardFooter>
      </Card>
    </div>
  )
}
