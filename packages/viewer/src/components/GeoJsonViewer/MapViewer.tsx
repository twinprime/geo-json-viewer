import React from "react"
import DeckGL from "@deck.gl/react"
import { TileLayer } from "@deck.gl/geo-layers"
import { BitmapLayer, GeoJsonLayer } from "@deck.gl/layers"
import { getFeatureLabel } from "../../utils/geojson"
import { getColor } from "../../utils/colors"
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
        getFillColor: [0, 120, 255, 100],
        getLineColor: (d) =>
          getColor(d.properties?.line_color, [255, 255, 255, 255]),
        getLineWidth: 1,
        getPointRadius: 5,

        // Interaction
        onClick: (info: PickingInfo) => {
          if (info.object) {
            onSelect(info.object.id)
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
          if (isSelected) return [255, 0, 0, 200] // Red for selected
          return [0, 255, 0, 100] // Green for highlight
        },
        getLineColor: (d) => {
          const id = d.id
          const isSelected = String(id) === String(selectedId)
          if (isSelected)
            return getColor(d.properties?.selected_line_color, [255, 0, 0, 255]) // Red for selected
          return getColor(d.properties?.hover_line_color, [0, 255, 0, 200]) // Green for highlight
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
