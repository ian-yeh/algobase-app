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

const chartConfig = {
  averageTime: {
    label: "Average Time",
    color: "var(--primary)",
  },
} satisfies ChartConfig

interface ChartAreaProps {
  solves: Solve[]
}

// Helper function to convert centiseconds to seconds with proper formatting
const formatTime = (centiseconds: number): string => {
  const seconds = centiseconds / 100
  return seconds.toFixed(2)
}

// Helper function to format time for display (e.g., "12.34s")
const formatTimeDisplay = (centiseconds: number): string => {
  const seconds = centiseconds / 100
  return `${seconds.toFixed(2)}s`
}

export function ChartAreaInteractive({ solves }: ChartAreaProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // --- Build daily average time data ---
  const chartData = React.useMemo(() => {
    const dailyData: Record<string, { times: number[], count: number }> = {}

    // Filter out DNF solves and group by date
    solves
      .filter(solve => !solve.dnf) // Exclude DNF solves from average calculation
      .forEach((solve) => {
        const date = new Date(solve.createdAt)
        const key = date.toISOString().split("T")[0] // YYYY-MM-DD
        
        if (!dailyData[key]) {
          dailyData[key] = { times: [], count: 0 }
        }
        
        // Add penalty time for +2
        const adjustedTime = solve.plusTwo ? solve.time + 200 : solve.time // +2 seconds in centiseconds
        dailyData[key].times.push(adjustedTime)
        dailyData[key].count++
      })

    // Calculate average for each day
    return Object.entries(dailyData)
      .map(([date, data]) => {
        const averageTime = data.times.reduce((sum, time) => sum + time, 0) / data.times.length
        return { 
          date, 
          averageTime: Math.round(averageTime), // Round to nearest centisecond
          count: data.count 
        }
      })
      .sort(([a], [b]) => a.localeCompare(b))
      .filter(item => item.count > 0) // Only include days with valid solves
  }, [solves])

  // --- Apply time filter ---
  const filteredData = React.useMemo(() => {
    if (chartData.length === 0) return []
    const lastDate = new Date(chartData[chartData.length - 1].date)
    let daysToSubtract = 90
    if (timeRange === "30d") daysToSubtract = 30
    if (timeRange === "7d") daysToSubtract = 7

    const startDate = new Date(lastDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return chartData.filter((item) => new Date(item.date) >= startDate)
  }, [chartData, timeRange])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Average Solve Time</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Daily average solve time (excluding DNFs)
          </span>
          <span className="@[540px]/card:hidden">Daily average time</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillAverageTime" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--primary)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  valueFormatter={(value) => formatTimeDisplay(value as number)}
                  indicator="dot"
                />
              }
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
