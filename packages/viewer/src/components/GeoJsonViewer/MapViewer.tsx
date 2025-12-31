import React from "react"
import DeckGL from "@deck.gl/react"
import { TileLayer } from "@deck.gl/geo-layers"
import { BitmapLayer, GeoJsonLayer } from "@deck.gl/layers"
import { getFeatureLabel } from "../../utils/geojson"
import { getColor, adjustBrightness } from "../../utils/colors"
import type {
  MapViewState,
  PickingInfo,
  MapViewState as ViewState,
} from "@deck.gl/core"
import type { GeoJSON } from "geojson"
import type { ProcessedFeature } from "../../utils/geojson"

interface MapViewerProps {
  data: GeoJSON | null
  features: ProcessedFeature[]
  selectedId: string | number | null
  highlightedId: string | number | null
  viewState: ViewState

  onSelect: (id: string | number | null) => void
  onHighlight: (id: string | number | null) => void
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
  // Layers
  const layers = [
    new TileLayer({
      id: "base-map",
      data: "https://basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
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

        // Styling - Base layer always default style (Blue/Black)
        getFillColor: (d) => {
          const baseColor = [0, 120, 255, 100] as [
            number,
            number,
            number,
            number,
          ]
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

        // Interaction
        onClick: (info: PickingInfo) => {
          if (info.object) {
            if (String(info.object.id) === String(selectedId)) {
              onSelect(null)
            } else {
              onSelect(info.object.id)
            }
          } else {
            onSelect(null)
          }
        },
        onHover: (info: PickingInfo) => {
          if (info.object) {
            onHighlight(info.object.id)
          } else {
            onHighlight(null)
          }
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
          return adjustBrightness([0, 255, 0, 100], 1.5) // Green for highlight
        },
        getLineColor: (d) => {
          const id = d.id
          const isSelected = String(id) === String(selectedId)
          if (isSelected)
            return adjustBrightness(
              getColor(d.properties?.selected_line_color, [255, 0, 0, 255]),
              1.5
            ) // Red for selected
          return adjustBrightness(
            getColor(d.properties?.hover_line_color, [0, 255, 0, 200]),
            1.5
          ) // Green for highlight
        },
        getLineWidth: 2,
        getPointRadius: 6,

        updateTriggers: {
          getFillColor: [selectedId, highlightedId],
          getLineColor: [selectedId, highlightedId],
        },
      }),
  ].filter(Boolean)

  return (
    <DeckGL
      initialViewState={viewState} // Initial view state ignored if viewState is provided controlled.
      viewState={viewState}
      onViewStateChange={({ viewState }) =>
        onViewStateChange(viewState as MapViewState)
      }
      controller={true}
      layers={layers}
      getTooltip={({ object }) =>
        object && {
          html: `<div>${getFeatureLabel(object)}</div>`,
        }
      }
      style={{ position: "relative", width: "100%", height: "100%" }} // Ensure it fits container
    />
  )
}
