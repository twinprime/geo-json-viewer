import React from 'react';
import type { MapViewState as ViewState } from '@deck.gl/core';
import type { GeoJSON } from 'geojson';
import type { ProcessedFeature } from '../../utils/geojson';
interface MapViewerProps {
    data: GeoJSON | null;
    features: ProcessedFeature[];
    selectedId: string | number | null;
    highlightedId: string | number | null;
    viewState: ViewState;
    onSelect: (id: string | number | null) => void;
    onHighlight: (id: string | number | null) => void;
    onViewStateChange: (viewState: ViewState) => void;
}
export declare const MapViewer: React.FC<MapViewerProps>;
export {};
