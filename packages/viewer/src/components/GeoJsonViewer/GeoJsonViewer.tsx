import React, { useState, useMemo, useEffect } from 'react';
import type { GeoJSON } from 'geojson';
import { WebMercatorViewport } from '@math.gl/web-mercator';
import { FlyToInterpolator } from '@deck.gl/core';
import type { MapViewState } from '@deck.gl/core';

import { GeoJsonViewerLayout } from './GeoJsonViewerLayout';
import { MapViewer } from './MapViewer';
import { SidePanel } from './SidePanel/SidePanel';
import { processGeoJSON, getFeatureBounds, getCollectionBounds } from '../../utils/geojson';

interface GeoJsonViewerProps {
  data: GeoJSON | null;
}

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 103.8198,
  latitude: 1.3521,
  zoom: 11,
  pitch: 0,
  bearing: 0
};

export const GeoJsonViewer: React.FC<GeoJsonViewerProps> = ({ data }) => {
  // State
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
  const [sidePanelWidth, setSidePanelWidth] = useState(320);

  // Derived State
  const features = useMemo(() => {
    if (!data) return [];
    const processed = processGeoJSON(data);
    return processed.features;
  }, [data]);

  // Effects
  useEffect(() => {
    // When data loads, fit bounds
    if (features.length > 0) {
       const bounds = getCollectionBounds(features);
       if (bounds) {
         // Calculate map width based on layout
         const mapWidth = window.innerWidth - sidePanelWidth;
         
         const viewport = new WebMercatorViewport({
             width: mapWidth, 
             height: window.innerHeight 
         });
   
         const { longitude, latitude, zoom } = viewport.fitBounds(
             [[bounds[0], bounds[1]], [bounds[2], bounds[3]]],
             { padding: 50 }
         );
  
         setViewState(prev => ({
             ...prev,
             longitude,
             latitude,
             zoom: Math.min(zoom, 18),
             transitionDuration: 1000,
             transitionInterpolator: new FlyToInterpolator()
         }));
       }
    } else {
        // Reset or keep? Maybe keep for now.
    }
  }, [features]); // Trigger on features change (data change)

  // Actions
  const flyToFeature = (id: string | number) => {
      const feature = features.find(f => String(f.id) === String(id));
      if (!feature) return;

      const bounds = getFeatureBounds(feature);
      if (!bounds) return;

      const mapWidth = window.innerWidth - sidePanelWidth;

      const viewport = new WebMercatorViewport({
          width: mapWidth, 
          height: window.innerHeight 
      });

      const { longitude, latitude, zoom } = viewport.fitBounds(
          [[bounds[0], bounds[1]], [bounds[2], bounds[3]]],
          { padding: 100 }
      );

      setViewState(prev => ({
          ...prev,
          longitude,
          latitude,
          zoom,
          transitionDuration: 1000,
          transitionInterpolator: new FlyToInterpolator()
      }));
  };

  return (
    <GeoJsonViewerLayout
      sidePanelWidth={sidePanelWidth}
      onSidePanelWidthChange={setSidePanelWidth}
      sidePanel={
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
      }
      mapPanel={
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
      }
    />
  );
};
