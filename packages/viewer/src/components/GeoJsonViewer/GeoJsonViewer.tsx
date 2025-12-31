import React, { useState, useMemo, useEffect } from "react"
import type { GeoJSON } from "geojson"
import { WebMercatorViewport } from "@math.gl/web-mercator"
import { FlyToInterpolator } from "@deck.gl/core"
import type { MapViewState } from "@deck.gl/core"
import { Layers } from "lucide-react"

import { MapViewer } from "./MapViewer"
import { SidePanel } from "./SidePanel/SidePanel"
import { BottomPanel } from "./BottomPanel/BottomPanel"
import { ResizablePanel } from "../common/ResizablePanel"
import {
  processGeoJSON,
  getFeatureBounds,
  getCollectionBounds,
} from "../../utils/geojson"

interface GeoJsonViewerProps {
  data: GeoJSON | null
}

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 103.8198,
  latitude: 1.3521,
  zoom: 11,
  pitch: 0,
  bearing: 0,
}

export const GeoJsonViewer: React.FC<GeoJsonViewerProps> = ({ data }) => {
  // State
  const [selectedId, setSelectedId] = useState<string | number | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | number | null>(
    null
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE)
  const [sidePanelWidth, setSidePanelWidth] = useState(320)
  const [isSidePanelExpanded, setIsSidePanelExpanded] = useState(true)

  // Derived State
  const features = useMemo(() => {
    if (!data) return []
    const processed = processGeoJSON(data)
    return processed.features
  }, [data])

  const selectedFeature = useMemo(() => {
    if (!selectedId) return null
    return features.find((f) => String(f.id) === String(selectedId)) || null
  }, [features, selectedId])

  const getMapWidth = () => {
    return window.innerWidth - (isSidePanelExpanded ? sidePanelWidth : 40)
  }

  // Effects
  useEffect(() => {
    // When data loads, fit bounds
    if (features.length > 0) {
      const bounds = getCollectionBounds(features)
      if (bounds) {
        // Calculate map width based on layout
        const mapWidth = getMapWidth()

        const viewport = new WebMercatorViewport({
          width: mapWidth,
          height: window.innerHeight,
        })

        const { longitude, latitude, zoom } = viewport.fitBounds(
          [
            [bounds[0], bounds[1]],
            [bounds[2], bounds[3]],
          ],
          { padding: 50 }
        )

        setViewState((prev) => ({
          ...prev,
          longitude,
          latitude,
          zoom: Math.min(zoom, 18),
          transitionDuration: 1000,
          transitionInterpolator: new FlyToInterpolator(),
        }))
      }
    } else {
      // Reset or keep? Maybe keep for now.
    }
  }, [features, isSidePanelExpanded, sidePanelWidth]) // Trigger on layout change too

  // Actions
  const flyToFeature = (id: string | number) => {
    const feature = features.find((f) => String(f.id) === String(id))
    if (!feature) return

    const bounds = getFeatureBounds(feature)
    if (!bounds) return

    const mapWidth = getMapWidth()

    const viewport = new WebMercatorViewport({
      width: mapWidth,
      height: window.innerHeight,
    })

    const { longitude, latitude, zoom } = viewport.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      { padding: 100 }
    )

    setViewState((prev) => ({
      ...prev,
      longitude,
      latitude,
      zoom,
      transitionDuration: 1000,
      transitionInterpolator: new FlyToInterpolator(),
    }))
  }

  return (
    <div className="flex overflow-hidden h-full w-full">
      {/* Left Panel: Resizable */}
      <ResizablePanel
        position="left"
        size={sidePanelWidth}
        onSizeChange={setSidePanelWidth}
        isExpanded={isSidePanelExpanded}
        onExpandChange={setIsSidePanelExpanded}
        tabs={[
          {
            id: "features",
            label: "Features",
            icon: <Layers size={16} className="text-blue-400" />,
            content: (
              <SidePanel
                features={features}
                selectedId={selectedId}
                highlightedId={highlightedId}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelect={setSelectedId}
                onHighlight={setHighlightedId}
                onDoubleClick={flyToFeature}
              />
            ),
          },
        ]}
        className="border-r border-gray-700"
      />

      {/* Right Panel: Map View & Bottom Panel */}
      <div className="flex-1 flex flex-col relative bg-gray-800 overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          <MapViewer
            data={data}
            features={features}
            selectedId={selectedId}
            highlightedId={highlightedId}
            viewState={viewState}
            onSelect={setSelectedId}
            onHighlight={setHighlightedId}
            onViewStateChange={setViewState}
          />
        </div>
        <BottomPanel feature={selectedFeature} />
      </div>
    </div>
  )
}
