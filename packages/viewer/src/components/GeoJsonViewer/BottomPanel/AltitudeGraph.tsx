import React, { useEffect, useRef, useMemo } from "react"
import * as d3 from "d3"
import { RotateCcw } from "lucide-react"
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
    processLineString(feature.geometry.coordinates)
  } else if (feature.geometry.type === "MultiLineString") {
    feature.geometry.coordinates.forEach((line) => processLineString(line))
  }

  return points.sort((a, b) => a.time.getTime() - b.time.getTime())
}

export const AltitudeGraph: React.FC<AltitudeGraphProps> = ({ feature }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const resetZoomRef = useRef<() => void>(() => {})
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

    const drawChart = () => {
      const width = container.clientWidth - margin.left - margin.right
      const height = container.clientHeight - margin.top - margin.bottom

      if (width <= 0 || height <= 0) return

      // Re-select or create SVG
      d3.select(container).selectAll("svg").remove()
      d3.select(container).selectAll("div").remove()

      const svg = d3
        .select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

      // Define clip path
      svg
        .append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height)

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)

      // Base scales
      const xBase = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => d.time) as [Date, Date])
        .range([0, width])

      const yBase = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.altitude / 100) as number])
        .range([height, 0])

      // Axes groups
      const xAxisGroup = g
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)

      const yAxisGroup = g.append("g").attr("class", "y-axis")

      // Line path
      const path = g
        .append("path")
        .datum(data)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("clip-path", "url(#clip)")

      // Zoom Rects
      // 1. Main Zoom Rect (Chart Area)
      const mainZoomRect = g
        .append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "transparent")
        .style("cursor", "move")

      // 2. X-Axis Zoom Rect
      const xAxisZoomRect = g
        .append("rect")
        .attr("width", width)
        .attr("height", margin.bottom)
        .attr("transform", `translate(0,${height})`)
        .attr("fill", "transparent")
        .style("cursor", "col-resize")

      // 3. Y-Axis Zoom Rect
      const yAxisZoomRect = g
        .append("rect")
        .attr("width", margin.left)
        .attr("height", height)
        .attr("transform", `translate(${-margin.left},0)`)
        .attr("fill", "transparent")
        .style("cursor", "row-resize")

      // Update function
      const update = () => {
        // Get current transforms
        const tMain = d3.zoomTransform(mainZoomRect.node()!)
        const tX = d3.zoomTransform(xAxisZoomRect.node()!)
        const tY = d3.zoomTransform(yAxisZoomRect.node()!)

        // Rescale scales
        // Apply axis zooms first, then main zoom
        const xNew = tMain.rescaleX(tX.rescaleX(xBase))
        const yNew = tMain.rescaleY(tY.rescaleY(yBase))

        // Update axes
        xAxisGroup.call(
          d3.axisBottom(xNew).tickFormat(d3.timeFormat("%d %b %H:%M")).ticks(5)
        )
        yAxisGroup.call(d3.axisLeft(yNew))

        // Update line
        path.attr(
          "d",
          d3
            .line<DataPoint>()
            .x((d) => xNew(d.time))
            .y((d) => yNew(d.altitude / 100))
        )
      }

      // Zoom behaviors
      const zoomMain = d3
        .zoom<SVGRectElement, unknown>()
        .scaleExtent([0.5, 20])
        .on("zoom", update)

      const zoomX = d3
        .zoom<SVGRectElement, unknown>()
        .scaleExtent([0.5, 20])
        .on("zoom", update)

      const zoomY = d3
        .zoom<SVGRectElement, unknown>()
        .scaleExtent([0.5, 20])
        .on("zoom", update)

      // Attach zooms
      mainZoomRect.call(zoomMain)
      xAxisZoomRect.call(zoomX)
      yAxisZoomRect.call(zoomY)

      // Setup reset function
      resetZoomRef.current = () => {
        const t = d3.zoomIdentity
        mainZoomRect.transition().duration(750).call(zoomMain.transform, t)
        xAxisZoomRect.transition().duration(750).call(zoomX.transform, t)
        yAxisZoomRect.transition().duration(750).call(zoomY.transform, t)
      }

      // Initial update
      update()
    }

    drawChart()

    const resizeObserver = new ResizeObserver(() => {
      drawChart()
    })
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [data])

  return (
    <div className="relative w-full h-full min-h-[150px] group">
      <div ref={containerRef} className="w-full h-full" />
      {data.length > 0 && (
        <button
          onClick={() => resetZoomRef.current()}
          className="absolute top-2 right-4 bg-gray-800/80 hover:bg-gray-700 text-white p-1.5 rounded-md shadow-sm border border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Reset Zoom"
        >
          <RotateCcw size={16} />
        </button>
      )}
    </div>
  )
}
