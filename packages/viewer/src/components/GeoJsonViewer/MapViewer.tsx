import React, { useState } from "react"
import DeckGL from "@deck.gl/react"
import { TileLayer } from "@deck.gl/geo-layers"
import { BitmapLayer, GeoJsonLayer, TextLayer } from "@deck.gl/layers"
import {
  getFeatureTooltipHtml,
  getFeatureCentroid,
  getFeatureLabel,
} from "../../utils/geojson"
import { getColor, adjustBrightness } from "../../utils/colors"
import { Tag } from "lucide-react"
import type {
  MapViewState,
  PickingInfo,
  MapViewState as ViewState,
} from "@deck.gl/core"
import type { GeoJSON } from "geojson"
import type { ProcessedFeature } from "../../utils/geojson"

type FeatureId = string | number | null

interface MapViewerProps {
  data: GeoJSON | null
  features: ProcessedFeature[]
  selectedId: FeatureId
  highlightedId: FeatureId
  viewState: ViewState

  onSelect: (id: FeatureId) => void
  onHighlight: (id: FeatureId) => void
  onViewStateChange: (viewState: ViewState) => void
}

export const MapViewer: React.FC<MapViewerProps> = ({
  data,
  features,
  selectedId,
  highlightedId,
  viewState,
  onSelect,
  onHighlight,
  onViewStateChange,
}) => {
  const [showLabels, setShowLabels] = useState(true)

  // Layers
  const layers = [
    new TileLayer({
      id: "base-map",
      data: "https://basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderSubLayers: (props: any) => {
        const {
          bbox: { west, south, east, north },
        } = props.tile

        return new BitmapLayer(props, {
          data: undefined,
          image: props.data,
          bounds: [west, south, east, north],
        })
      },
    }),
    data &&
      new GeoJsonLayer({
        id: "geojson-layer-base",
        data,
        pickable: true,
        stroked: true,
        filled: true,
        pointType: "circle+text",
        lineWidthMinPixels: 1,
        pointRadiusMinPixels: 4,

        getFillColor: (d) => {
          const baseColor = getColor(
            d.properties?.fill_color,
            [255, 255, 255, 100]
          )
          const hasSelection = selectedId !== null || highlightedId !== null
          if (hasSelection) {
            const isSelected = String(d.id) === String(selectedId)
            const isHighlighted = String(d.id) === String(highlightedId)
            if (!isSelected && !isHighlighted) {
              return adjustBrightness(baseColor, 0.3)
            }
          }
          return baseColor
        },
        getLineColor: (d) => {
          const baseColor = getColor(
            d.properties?.line_color,
            [255, 255, 255, 255]
          )
          const hasSelection = selectedId !== null || highlightedId !== null
          if (hasSelection) {
            const isSelected = String(d.id) === String(selectedId)
            const isHighlighted = String(d.id) === String(highlightedId)
            if (!isSelected && !isHighlighted) {
              return adjustBrightness(baseColor, 0.3)
            }
          }
          return baseColor
        },
        getLineWidth: 1,
        getPointRadius: 5,

        updateTriggers: {
          getFillColor: [selectedId, highlightedId],
          getLineColor: [selectedId, highlightedId],
        },

        autoHighlight: false,
      }),
    // Separate layer for selected/highlighted features to ensure they are drawn on top
    (selectedId !== null || highlightedId !== null) &&
      new GeoJsonLayer({
        id: "geojson-layer-highlight",
        data: features.filter(
          (f) =>
            String(f.id) === String(selectedId) ||
            String(f.id) === String(highlightedId)
        ),
        pickable: false, // Interaction handled by base layer
        stroked: true,
        filled: true,
        pointType: "circle+text",
        lineWidthMinPixels: 2,
        pointRadiusMinPixels: 6,

        // Prevent z-fighting with base layer
        parameters: {
          depthTest: false,
        },

        // Styling
        getFillColor: (d) => {
          const id = d.id
          const isSelected = String(id) === String(selectedId)
          if (isSelected) return adjustBrightness([255, 0, 0, 200], 1.5) // Red for selected

          // Use original fill color but brighter for highlight
          const baseColor = getColor(
            d.properties?.fill_color,
            [0, 120, 255, 100]
          )
          return adjustBrightness(baseColor, 1.5)
        },
        getLineColor: (d) => {
          const id = d.id
          const isSelected = String(id) === String(selectedId)
          if (isSelected) return adjustBrightness([255, 0, 0, 255], 1.5) // Red for selected

          // Use original line color but brighter for highlight
          const baseColor = getColor(
            d.properties?.line_color,
            [0, 120, 255, 255]
          )
          return adjustBrightness(baseColor, 1.5)
        },
        getLineWidth: 2,
        getPointRadius: 6,

        updateTriggers: {
          getFillColor: [selectedId, highlightedId],
          getLineColor: [selectedId, highlightedId],
        },
      }),
    showLabels &&
      new TextLayer({
        id: "text-layer",
        data: features,
        pickable: true,
        getPosition: (d) => getFeatureCentroid(d),
        getText: (d) => getFeatureLabel(d),
        getSize: 12,
        getColor: [255, 255, 255, 255],
        getAngle: 0,
        getTextAnchor: "middle",
        getAlignmentBaseline: "center",
        fontFamily: "Inter, system-ui, sans-serif",
        background: true,
        getBackgroundColor: [0, 0, 0, 100],
        backgroundPadding: [4, 2],
      }),
  ].filter(Boolean)

  return (
    <div className="relative w-full h-full group">
      <DeckGL
        initialViewState={viewState} // Initial view state ignored if viewState is provided controlled.
        viewState={viewState}
        onViewStateChange={({ viewState }) =>
          onViewStateChange(viewState as MapViewState)
        }
        controller={true}
        layers={layers}
        onClick={(info: PickingInfo) => {
          if (info.object) {
            if (String(info.object.id) === String(selectedId)) {
              onSelect(null)
            } else {
              onSelect(info.object.id)
            }
          } else {
            onSelect(null)
          }
        }}
        onHover={(info: PickingInfo) => {
          if (info.object) {
            onHighlight(info.object.id)
          } else {
            onHighlight(null)
          }
        }}
        getTooltip={({ object }) =>
          object && {
            html: getFeatureTooltipHtml(object),
            className: "p-0 m-0 bg-transparent shadow-none border-none", // Reset default tooltip styles if any
            style: {
              backgroundColor: "transparent",
              padding: 0,
              boxShadow: "none",
            },
          }
        }
        style={{ position: "relative", width: "100%", height: "100%" }} // Ensure it fits container
      />
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowLabels(!showLabels)}
          className={`p-2 rounded-md shadow-md transition-colors ${
            showLabels
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
          title="Toggle Labels"
        >
          <Tag size={20} />
        </button>
      </div>
    </div>
  )
}
