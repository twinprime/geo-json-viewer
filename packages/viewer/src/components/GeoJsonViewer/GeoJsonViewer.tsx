import React, { useState, useMemo, useEffect, useCallback } from "react"
import type { GeoJSON } from "geojson"
import { WebMercatorViewport } from "@math.gl/web-mercator"
import { FlyToInterpolator } from "@deck.gl/core"
import type { MapViewState } from "@deck.gl/core"
import { Layers } from "lucide-react"
import jexl from "jexl"

// Add custom JEXL transforms
// eslint-disable-next-line @typescript-eslint/no-explicit-any
jexl.addTransform("match", (val: any, pattern: string, flags?: string) => {
  try {
    const regex = new RegExp(pattern, flags || "i")
    return regex.test(String(val))
  } catch {
    return false
  }
})

import { MapViewer } from "./MapViewer"
import { SidePanel } from "./SidePanel/SidePanel"
import { BottomPanel } from "./BottomPanel/BottomPanel"
import { ResizablePanel } from "../common/ResizablePanel"
import {
  processGeoJSON,
  getFeatureBounds,
  getCollectionBounds,
  type FeatureId,
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

export type SearchMode = "regex" | "jexl"

export const GeoJsonViewer: React.FC<GeoJsonViewerProps> = ({ data }) => {
  // State
  const [selectedId, setSelectedId] = useState<FeatureId | null>(null)
  const [highlightedId, setHighlightedId] = useState<FeatureId | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [searchMode, setSearchMode] = useState<SearchMode>("regex")
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE)
  const [sidePanelWidth, setSidePanelWidth] = useState(320)
  const [isSidePanelExpanded, setIsSidePanelExpanded] = useState(true)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Derived State
  const features = useMemo(() => {
    if (!data) return []
    const processed = processGeoJSON(data)
    return processed.features
  }, [data])

  const { filteredFeatures, searchError } = useMemo(() => {
    if (!debouncedSearchQuery)
      return { filteredFeatures: features, searchError: null }

    if (searchMode === "regex") {
      try {
        const regex = new RegExp(debouncedSearchQuery, "i")
        const filtered = features.filter((f) => {
          // Match against ID
          if (regex.test(String(f.id))) return true
          // Match against properties
          if (f.properties) {
            return Object.entries(f.properties).some(
              ([key, value]) => regex.test(key) || regex.test(String(value))
            )
          }
          return false
        })
        return { filteredFeatures: filtered, searchError: null }
      } catch (e) {
        // Invalid regex, return empty
        return { filteredFeatures: [], searchError: (e as Error).message }
      }
    } else {
      // JEXL mode
      try {
        const expression = jexl.compile(debouncedSearchQuery)
        const filtered = features.filter((f) => {
          // Context for JEXL is the feature properties
          // We also include id and type
          const context = {
            ...f.properties,
            id: f.id,
            type: f.type,
          }
          return expression.evalSync(context)
        })
        return { filteredFeatures: filtered, searchError: null }
      } catch (e) {
        // Invalid JEXL expression, return empty
        return { filteredFeatures: [], searchError: (e as Error).message }
      }
    }
  }, [features, debouncedSearchQuery, searchMode])

  const selectedFeature = useMemo(() => {
    if (!selectedId) return null
    return features.find((f) => String(f.id) === String(selectedId)) || null
  }, [features, selectedId])

  const getMapWidth = useCallback(() => {
    return window.innerWidth - (isSidePanelExpanded ? sidePanelWidth : 40)
  }, [isSidePanelExpanded, sidePanelWidth])

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

        requestAnimationFrame(() => {
          setViewState((prev) => ({
            ...prev,
            longitude,
            latitude,
            zoom: Math.min(zoom, 18),
            transitionDuration: 1000,
            transitionInterpolator: new FlyToInterpolator(),
          }))
        })
      }
    } else {
      // Reset or keep? Maybe keep for now.
    }
  }, [features, getMapWidth]) // Trigger on layout change too

  // Actions
  const flyToFeature = useCallback(
    (id: FeatureId) => {
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
    },
    [features, getMapWidth]
  )

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
                features={filteredFeatures}
                selectedId={selectedId}
                highlightedId={highlightedId}
                searchQuery={searchQuery}
                searchMode={searchMode}
                searchError={searchError}
                onSearchChange={setSearchQuery}
                onSearchModeChange={setSearchMode}
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
            features={filteredFeatures}
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
