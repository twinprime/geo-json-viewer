import React from 'react';
import DeckGL from '@deck.gl/react';
import { TileLayer } from '@deck.gl/geo-layers';
import { GeoJsonLayer } from '@deck.gl/layers';
import { BitmapLayer } from '@deck.gl/layers';
import { useAppStore } from '../../store/useAppStore';
import { getFeatureLabel } from '../../utils/geojson';
import type { PickingInfo } from '@deck.gl/core';



export const MapViewer: React.FC = () => {
  const { data, features, selectedId, highlightedId, selectFeature, highlightFeature, viewState, setViewState } = useAppStore();

  // Layers
  const layers = [
    new TileLayer({
      id: 'base-map',
      data: 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      renderSubLayers: (props: any) => {
        const {
          bbox: { west, south, east, north }
        } = props.tile;

        return new BitmapLayer(props, {
          data: undefined,
          image: props.data,
          bounds: [west, south, east, north]
        });
      }
    }),
    data && new GeoJsonLayer({
      id: 'geojson-layer-base',
      data,
      pickable: true,
      stroked: true,
      filled: true,
      pointType: 'circle+text',
      lineWidthMinPixels: 1,
      pointRadiusMinPixels: 4,
      
      // Styling - Base layer always default style (Blue/Black)
      getFillColor: [0, 120, 255, 100], 
      getLineColor: [0, 0, 0, 255],
      getLineWidth: 1,
      getPointRadius: 5,

      // Interaction
      onClick: (info: PickingInfo) => {
        if (info.object) {
          selectFeature(info.object.id);
        } else {
            selectFeature(null);
        }
      },
      onHover: (info: PickingInfo) => {
        if (info.object) {
          highlightFeature(info.object.id);
        } else {
          highlightFeature(null);
        }
      },
      
      autoHighlight: false
    }),
    // Separate layer for selected/highlighted features to ensure they are drawn on top
    (selectedId !== null || highlightedId !== null) && new GeoJsonLayer({
      id: 'geojson-layer-highlight',
      data: features.filter(f => String(f.id) === String(selectedId) || String(f.id) === String(highlightedId)),
      pickable: false, // Interaction handled by base layer
      stroked: true,
      filled: true,
      pointType: 'circle+text',
      lineWidthMinPixels: 2,
      pointRadiusMinPixels: 6,
      
      // Prevent z-fighting with base layer
      parameters: {
        depthTest: false
      },

      // Styling
      getFillColor: (d: any) => {
        const id = d.id;
        const isSelected = String(id) === String(selectedId);
        if (isSelected) return [255, 0, 0, 200]; // Red for selected
        return [0, 255, 0, 100]; // Green for highlight
      },
      getLineColor: (d: any) => {
        const id = d.id;
        const isSelected = String(id) === String(selectedId);
        if (isSelected) return [255, 0, 0, 255]; // Red for selected
        return [0, 255, 0, 200]; // Green for highlight
      },
      getLineWidth: 2,
      getPointRadius: 6,
      
      updateTriggers: {
        getFillColor: [selectedId, highlightedId],
        getLineColor: [selectedId, highlightedId]
      }
    })
  ].filter(Boolean);

  return (
    <DeckGL
      initialViewState={viewState as any} // Initial view state ignored if viewState is provided controlled.
      viewState={viewState}
      onViewStateChange={({ viewState }) => setViewState(viewState as any)}
      controller={true}
      layers={layers}
      getTooltip={({ object }) => object && {
          html: `<div>${getFeatureLabel(object as any)}</div>`
      }}
      style={{ position: 'relative', width: '100%', height: '100%' }} // Ensure it fits container
    />
  );
};
