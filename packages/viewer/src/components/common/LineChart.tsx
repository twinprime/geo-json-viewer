import React, { useEffect, useRef } from "react"
import * as d3 from "d3"
import { RotateCcw } from "lucide-react"

export interface ChartDataPoint {
  time: Date
  value: number
}

interface LineChartProps {
  data: ChartDataPoint[]
  color?: string
  emptyMessage?: string
}

const renderChart = (
  container: HTMLDivElement,
  data: ChartDataPoint[],
  color: string,
  onResetZoomReady: (reset: () => void) => void
) => {
  const margin = { top: 20, right: 30, bottom: 40, left: 50 }
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

  const clipId = `clip-${Math.random().toString(36).substr(2, 9)}`

  // Define clip path
  svg
    .append("defs")
    .append("clipPath")
    .attr("id", clipId)
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
    .domain([0, d3.max(data, (d) => d.value) as number])
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
    .attr("stroke", color)
    .attr("stroke-width", 1.5)
    .attr("clip-path", `url(#${clipId})`)

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
    const ticks = xNew.ticks(Math.max(2, Math.floor(width / 80)))
    let showSeconds = false
    if (ticks.length >= 2) {
      const interval = ticks[1].getTime() - ticks[0].getTime()
      showSeconds = interval < 60000
    }

    let lastDateStr = ""
    const xAxis = d3
      .axisBottom(xNew)
      .tickFormat((d, i) => {
        const date = d as Date
        const dateStr = d3.timeFormat("%Y-%m-%d")(date)
        const format = showSeconds ? "%H:%M:%S" : "%H:%M"
        const timeStr = d3.timeFormat(format)(date)
        if (i === 0 || dateStr !== lastDateStr) {
          lastDateStr = dateStr
          return `${dateStr} ${timeStr}`
        }
        return timeStr
      })
      .ticks(Math.max(2, Math.floor(width / 80)))

    xAxisGroup.call(xAxis)
    yAxisGroup.call(d3.axisLeft(yNew))

    // Update line
    const lineGenerator = d3
      .line<ChartDataPoint>()
      .x((d) => xNew(d.time))
      .y((d) => yNew(d.value))

    path.attr("d", lineGenerator)
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
  const reset = () => {
    const t = d3.zoomIdentity
    mainZoomRect.transition().duration(750).call(zoomMain.transform, t)
    xAxisZoomRect.transition().duration(750).call(zoomX.transform, t)
    yAxisZoomRect.transition().duration(750).call(zoomY.transform, t)
  }
  onResetZoomReady(reset)

  // Initial update
  update()
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  color = "steelblue",
  emptyMessage = "No data available",
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const resetZoomRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // Clear previous svg
    d3.select(container).selectAll("*").remove()

    if (!data.length) {
      d3.select(container)
        .append("div")
        .attr("class", "flex items-center justify-center h-full text-gray-400")
        .text(emptyMessage)
      return
    }

    const handleResize = () => {
      renderChart(container, data, color, (reset) => {
        resetZoomRef.current = reset
      })
    }

    handleResize()

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [data, color, emptyMessage])

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
