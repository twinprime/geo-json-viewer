import React, { useEffect, useRef, useMemo } from "react"
import * as d3 from "d3"
import type { Feature, LineString, MultiLineString, Position } from "geojson"

interface DataPoint {
  time: Date
  altitude: number
}

interface AltitudeGraphProps {
  feature: Feature | null
}

const extractDataPoints = (feature: Feature | null): DataPoint[] => {
  if (!feature || !feature.geometry) return []
  const points: DataPoint[] = []

  const processLineString = (coords: Position[]) => {
    coords.forEach((coord) => {
      if (coord.length >= 4) {
        const altitude = coord[2]
        const timestamp = coord[3]
        if (typeof timestamp === "number") {
          points.push({
            time: new Date(timestamp),
            altitude: altitude,
          })
        }
      }
    })
  }

  if (feature.geometry.type === "LineString") {
    processLineString((feature.geometry as LineString).coordinates)
  } else if (feature.geometry.type === "MultiLineString") {
    ;(feature.geometry as MultiLineString).coordinates.forEach((line) =>
      processLineString(line)
    )
  }

  return points.sort((a, b) => a.time.getTime() - b.time.getTime())
}

export const AltitudeGraph: React.FC<AltitudeGraphProps> = ({ feature }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const data = useMemo(() => extractDataPoints(feature), [feature])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // Clear previous svg
    d3.select(container).selectAll("*").remove()

    if (!data.length) {
      d3.select(container)
        .append("div")
        .attr("class", "flex items-center justify-center h-full text-gray-400")
        .text("No altitude profile available for selected feature")
      return
    }

    const margin = { top: 20, right: 30, bottom: 40, left: 50 }

    const updateChart = () => {
      const width = container.clientWidth - margin.left - margin.right
      const height = container.clientHeight - margin.top - margin.bottom

      if (width <= 0 || height <= 0) return

      // Re-select or create SVG
      d3.select(container).selectAll("svg").remove()
      d3.select(container).selectAll("div").remove() // Remove "no data" message if present

      const svg = d3
        .select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)

      // X axis
      const x = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => d.time) as [Date, Date])
        .range([0, width])

      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(
          d3
            .axisBottom(x)
            .tickFormat(d3.timeFormat("%d %b %H:%M") as any)
            .ticks(5)
        )

      // Y axis (Flight Levels = feet / 100)
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.altitude / 100) as number])
        .range([height, 0])

      svg.append("g").call(d3.axisLeft(y))

      // Add the line
      svg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr(
          "d",
          d3
            .line<DataPoint>()
            .x((d) => x(d.time))
            .y((d) => y(d.altitude / 100))
        )
    }

    updateChart()

    const resizeObserver = new ResizeObserver(() => {
      updateChart()
    })
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [data])

  return <div ref={containerRef} className="w-full h-full min-h-[150px]" />
}
