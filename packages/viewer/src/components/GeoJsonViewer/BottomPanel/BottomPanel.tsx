import React, { useState } from "react"
import { Activity, Gauge } from "lucide-react"
import { AltitudeGraph } from "./AltitudeGraph"
import { SpeedGraph } from "./SpeedGraph"
import { ResizablePanel, Tab } from "../../common/ResizablePanel"
import type { Feature } from "geojson"

interface BottomPanelProps {
  feature: Feature | null
}

export const BottomPanel: React.FC<BottomPanelProps> = ({ feature }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [height, setHeight] = useState(250)

  const tabs: Tab[] = [
    {
      id: "altitude",
      label: "Altitude",
      icon: <Activity size={16} />,
      content: (
        <div className="h-full w-full p-4">
          <AltitudeGraph feature={feature} />
        </div>
      ),
    },
    {
      id: "speed",
      label: "Speed",
      icon: <Gauge size={16} />,
      content: (
        <div className="h-full w-full p-4">
          <SpeedGraph />
        </div>
      ),
    },
  ]

  return (
    <ResizablePanel
      position="bottom"
      size={height}
      onSizeChange={setHeight}
      isExpanded={isExpanded}
      onExpandChange={setIsExpanded}
      minSize={150}
      maxSize={800}
      tabs={tabs}
      className="border-t border-gray-700"
    />
  )
}
