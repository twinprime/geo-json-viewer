import React, { useMemo } from "react"
import type { Feature, Position } from "geojson"
import { LineChart, ChartDataPoint } from "../../common/LineChart"

interface AltitudeGraphProps {
  feature: Feature | null
}

const extractDataPoints = (feature: Feature | null): ChartDataPoint[] => {
  if (!feature?.geometry) return []
  const points: ChartDataPoint[] = []

  const processLineString = (coords: Position[]) => {
    coords.forEach((coord) => {
      if (coord.length >= 4) {
        const altitude = coord[2]
        const timestamp = coord[3]
        if (typeof timestamp === "number") {
          points.push({
            time: new Date(timestamp),
            value: altitude / 100,
          })
        }
      }
    })
  }

  if (feature.geometry.type === "LineString") {
    processLineString(feature.geometry.coordinates)
  } else if (feature.geometry.type === "MultiLineString") {
    feature.geometry.coordinates.forEach((line) => processLineString(line))
  }

  return points.sort((a, b) => a.time.getTime() - b.time.getTime())
}

export const AltitudeGraph: React.FC<AltitudeGraphProps> = ({ feature }) => {
  const data = useMemo(() => extractDataPoints(feature), [feature])

  return (
    <LineChart
      data={data}
      color="steelblue"
      emptyMessage="No altitude profile available for selected feature"
    />
  )
}
