"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Solve } from "@/lib/types/SolveTypes"

export const description = "Individual solve times"

const chartConfig: ChartConfig = {
  averageTime: {
    label: "Solve Time",
    color: "var(--primary)",
  },
}

interface ChartAreaProps {
  solves: Solve[]
}

type SolveRange = "10solves" | "50solves" | "100solves"

interface ChartPoint {
  date: string
  averageTime: number
  count: number
}

const formatTimeDisplay = (centiseconds: number): string => {
  const seconds = centiseconds / 100
  return `${seconds.toFixed(2)}s`
}

export function ChartAreaInteractive({ solves }: ChartAreaProps) {
  const isMobile = useIsMobile()
  const [solveRange, setSolveRange] = React.useState<SolveRange>("100solves")

  React.useEffect(() => {
    if (isMobile) setSolveRange("10solves")
  }, [isMobile])

  const chartData: ChartPoint[] = React.useMemo(() => {
    const output = solves
      .filter((s) => !s.dnf)
      .map((solve) => {
        const adjustedTime = solve.plusTwo ? solve.time + 200 : solve.time
        return {
          date: new Date(solve.createdAt).toISOString(), 
          averageTime: adjustedTime, 
          count: 1
        }
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return output;
  }, [solves])

  const filteredData: ChartPoint[] = React.useMemo(() => {
    if (chartData.length === 0) return []

    const getSolveCount = (range: SolveRange): number => {
      switch (range) {
        case "10solves": return 10
        case "50solves": return 50  
        case "100solves": return 100
        default: return 100
      }
    }

    const solveCount = getSolveCount(solveRange)
    
    // Take the last N solves
    return chartData.slice(-solveCount)
  }, [chartData, solveRange])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Solve Timeline</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            3x3 Times (excluding DNFs; +2 applied)
          </span>
          <span className="@[540px]/card:hidden">Solve Timeline</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={solveRange}
            onValueChange={(v) => v && setSolveRange(v as SolveRange)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="10solves">Last 10 solves</ToggleGroupItem>
            <ToggleGroupItem value="50solves">Last 50 solves</ToggleGroupItem>
            <ToggleGroupItem value="100solves">Last 100 solves</ToggleGroupItem>
          </ToggleGroup>
          <Select value={solveRange} onValueChange={(v) => setSolveRange(v as SolveRange)}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 10 solves" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="10solves" className="rounded-lg">Last 10 solves</SelectItem>
              <SelectItem value="50solves" className="rounded-lg">Last 50 solves</SelectItem>
              <SelectItem value="100solves" className="rounded-lg">Last 100 solves</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillAverageTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string | number) =>
                new Date(String(value)).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      label={label ? new Date(label).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      }) : ""}
                      formatter={(value) => [formatTimeDisplay(value as number), ""]}
                      indicator="dot"
                    />
                  )
                }
                return null
              }}
            />
            <Area
              dataKey="averageTime"
              type="monotone"
              fill="url(#fillAverageTime)"
              stroke="var(--primary)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
