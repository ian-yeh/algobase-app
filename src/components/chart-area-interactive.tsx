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

export const description = "Average solve time per day"

const chartConfig: ChartConfig = {
  averageTime: {
    label: "Average Time",
    color: "var(--primary)",
  },
}

interface ChartAreaProps {
  solves: Solve[]
}

type TimeRange = "90d" | "30d" | "7d"

interface DailyBucket {
  times: number[]
  count: number
}

interface ChartPoint {
  date: string            // YYYY-MM-DD
  averageTime: number     // centiseconds
  count: number           // # solves that day
}

// Convert centiseconds -> seconds (as string with 2 decimals, no "s")
const formatTime = (centiseconds: number): string => (centiseconds / 100).toFixed(2)

const formatTimeDisplay = (centiseconds: number): string => {
  const seconds = centiseconds / 100
  return `${seconds.toFixed(2)}s`
}

export function ChartAreaInteractive({ solves }: ChartAreaProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState<TimeRange>("90d")

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d")
  }, [isMobile])

  // --- Build daily average time data ---
  const chartData: ChartPoint[] = React.useMemo(() => {
    const daily: Record<string, DailyBucket> = {}

    // Group valid solves by date (YYYY-MM-DD)
    solves
      .filter((s) => !s.dnf)
      .forEach((s) => {
        const d = new Date(s.createdAt)
        const key = d.toISOString().split("T")[0]
        if (!daily[key]) daily[key] = { times: [], count: 0 }
        const adjusted = s.plusTwo ? s.time + 200 : s.time
        daily[key].times.push(adjusted)
        daily[key].count += 1
      })

    // Sort by date first, then compute averages
    return Object.entries(daily)
      .sort(([a], [b]) => a.localeCompare(b))
      .map<ChartPoint>(([date, bucket]) => {
        const avg =
          bucket.times.reduce((sum, t) => sum + t, 0) / (bucket.times.length || 1)
        return {
          date,
          averageTime: Math.round(avg), // keep as centiseconds for the y-value
          count: bucket.count,
        }
      })
  }, [solves])

  // --- Apply time filter ---
  const filteredData: ChartPoint[] = React.useMemo(() => {
    if (chartData.length === 0) return []
    const lastDate = new Date(chartData[chartData.length - 1].date)

    const subtractDays = (range: TimeRange): number =>
      range === "30d" ? 30 : range === "7d" ? 7 : 90

    const startDate = new Date(lastDate)
    startDate.setDate(startDate.getDate() - subtractDays(timeRange))

    return chartData.filter((p) => new Date(p.date) >= startDate)
  }, [chartData, timeRange])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Average Solve Time</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Daily average (excluding DNFs; +2 applied)
          </span>
          <span className="@[540px]/card:hidden">Daily average time</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(v) => v && setTimeRange(v as TimeRange)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
              <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
              <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
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
                      formatter={(value) => [formatTimeDisplay(value as number), "Average Time"]}
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
