import React, { useState } from "react"
import { ChevronUp, ChevronDown, Activity } from "lucide-react"
import { AltitudeGraph } from "./AltitudeGraph"
import type { Feature } from "geojson"

interface BottomPanelProps {
  feature: Feature | null
}

export const BottomPanel: React.FC<BottomPanelProps> = ({ feature }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [height, setHeight] = useState(250)
  const [isResizing, setIsResizing] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const startY = e.clientY
    const startHeight = height
    setIsResizing(true)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY
      // Dragging up (negative delta) increases height
      const newHeight = Math.max(150, Math.min(800, startHeight - deltaY))
      setHeight(newHeight)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ""
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.body.style.cursor = "row-resize"
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <div
      className={`flex flex-col border-t border-gray-700 bg-gray-900 text-white shrink-0 relative ${
        isResizing ? "" : "transition-all duration-300 ease-in-out"
      }`}
      style={{ height: isExpanded ? `${height}px` : "40px" }}
    >
      {/* Resize Handle */}
      {isExpanded && (
        <div
          className="absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-blue-500 z-10 bg-transparent"
          onMouseDown={handleMouseDown}
          style={{ height: "4px", transform: "translateY(-2px)" }}
        />
      )}

      {/* Header / Toggle Bar */}
      <button
        className="flex items-center justify-between px-4 h-10 bg-gray-800 cursor-pointer hover:bg-gray-700 select-none border-b border-gray-700 w-full text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <Activity size={16} className="text-blue-400" />
          <span>Altitude Profile</span>
        </div>
        <div className="text-gray-400 hover:text-white">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </button>

      {/* Content */}
      <div
        className={`flex-1 overflow-hidden ${isExpanded ? "opacity-100" : "opacity-0"}`}
      >
        <div className="h-full w-full p-4">
          <AltitudeGraph feature={feature} />
        </div>
      </div>
    </div>
  )
}
