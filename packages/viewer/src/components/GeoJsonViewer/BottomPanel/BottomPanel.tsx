import React, { useState } from "react"
import { ChevronUp, ChevronDown, Activity } from "lucide-react"
import { AltitudeGraph } from "./AltitudeGraph"
import type { Feature } from "geojson"

interface BottomPanelProps {
  feature: Feature | null
}

export const BottomPanel: React.FC<BottomPanelProps> = ({ feature }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div
      className="flex flex-col border-t border-gray-700 bg-gray-900 text-white transition-all duration-300 ease-in-out shrink-0"
      style={{ height: isExpanded ? "250px" : "40px" }}
    >
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
