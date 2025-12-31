import React, { useMemo } from "react"
import { LineChart, ChartDataPoint } from "../../common/LineChart"

interface SpeedGraphProps {}

const generateDummyData = (): ChartDataPoint[] => {
  const points: ChartDataPoint[] = []
  const now = new Date()
  // Generate 100 points, one every minute
  for (let i = 0; i < 100; i++) {
    points.push({
      time: new Date(now.getTime() + i * 60000),
      value: 20 + Math.random() * 60 + Math.sin(i / 10) * 20, // Random speed with some wave
    })
  }
  return points
}

export const SpeedGraph: React.FC<SpeedGraphProps> = () => {
  const data = useMemo(() => generateDummyData(), [])

  return <LineChart data={data} color="#10b981" xAxisTickFormat="%H:%M" />
}
