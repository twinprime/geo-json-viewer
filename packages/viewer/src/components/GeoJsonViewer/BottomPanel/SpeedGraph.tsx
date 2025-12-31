import React, { useMemo } from "react"
import type { Feature, Position } from "geojson"
import distance from "@turf/distance"
import { point } from "@turf/helpers"
import { LineChart, ChartDataPoint } from "../../common/LineChart"

interface SpeedGraphProps {
  feature: Feature | null
}

const extractSpeedData = (feature: Feature | null): ChartDataPoint[] => {
  if (!feature?.geometry) return []
  const points: ChartDataPoint[] = []

  const processLineString = (coords: Position[]) => {
    if (coords.length < 2) return

    const calculatedPoints: ChartDataPoint[] = []

    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1]
      const curr = coords[i]

      const prevTime = prev[3]
      const currTime = curr[3]

      if (typeof prevTime === "number" && typeof currTime === "number") {
        const timeDiffMs = currTime - prevTime
        if (timeDiffMs <= 0) continue

        const timeDiffHours = timeDiffMs / 1000 / 3600

        const from = point([prev[0], prev[1]])
        const to = point([curr[0], curr[1]])
        const distKm = distance(from, to, { units: "kilometers" })

        const speedKmh = distKm / timeDiffHours
        const speedKnots = speedKmh / 1.852

        calculatedPoints.push({
          time: new Date(currTime),
          value: speedKnots,
        })
      }
    }

    if (calculatedPoints.length > 0 && typeof coords[0][3] === "number") {
      calculatedPoints.unshift({
        time: new Date(coords[0][3]),
        value: calculatedPoints[0].value,
      })
    }

    points.push(...calculatedPoints)
  }

  if (feature.geometry.type === "LineString") {
    processLineString(feature.geometry.coordinates)
  } else if (feature.geometry.type === "MultiLineString") {
    feature.geometry.coordinates.forEach((line) => processLineString(line))
  }

  return points.sort((a, b) => a.time.getTime() - b.time.getTime())
}

export const SpeedGraph: React.FC<SpeedGraphProps> = ({ feature }) => {
  const data = useMemo(() => extractSpeedData(feature), [feature])

  return (
    <LineChart
      data={data}
      color="#10b981"
      emptyMessage="No speed profile available for selected feature"
      xAxisTickFormat="%d %b %H:%M"
    />
  )
}
