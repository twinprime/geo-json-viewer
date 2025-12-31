import React, { useState } from "react"
import { Activity } from "lucide-react"
import { AltitudeGraph } from "./AltitudeGraph"
import { ResizablePanel } from "../../common/ResizablePanel"
import type { Feature } from "geojson"

interface BottomPanelProps {
  feature: Feature | null
}

export const BottomPanel: React.FC<BottomPanelProps> = ({ feature }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [height, setHeight] = useState(250)

  const headerContent = (
    <>
      <Activity size={16} className="text-blue-400" />
      <span>Altitude Profile</span>
    </>
  )

  return (
    <ResizablePanel
      position="bottom"
      size={height}
      onSizeChange={setHeight}
      isExpanded={isExpanded}
      onExpandChange={setIsExpanded}
      minSize={150}
      maxSize={800}
      header={headerContent}
      className="border-t border-gray-700"
    >
      <div className="h-full w-full p-4">
        <AltitudeGraph feature={feature} />
      </div>
    </ResizablePanel>
  )
}
