import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { WebMercatorViewport } from '@math.gl/web-mercator';
import { FlyToInterpolator } from '@deck.gl/core';
import { GeoJsonViewerLayout } from './GeoJsonViewerLayout';
import { MapViewer } from './MapViewer';
import { SidePanel } from './SidePanel/SidePanel';
import { processGeoJSON, getFeatureBounds, getCollectionBounds } from '../../utils/geojson';
const INITIAL_VIEW_STATE = {
    longitude: 103.8198,
    latitude: 1.3521,
    zoom: 11,
    pitch: 0,
    bearing: 0
};
export const GeoJsonViewer = ({ data }) => {
    // State
    const [selectedId, setSelectedId] = useState(null);
    const [highlightedId, setHighlightedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
    const [sidePanelWidth, setSidePanelWidth] = useState(320);
    // Derived State
    const features = useMemo(() => {
        if (!data)
            return [];
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
                const { longitude, latitude, zoom } = viewport.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]], { padding: 50 });
                setViewState(prev => ({
                    ...prev,
                    longitude,
                    latitude,
                    zoom: Math.min(zoom, 18),
                    transitionDuration: 1000,
                    transitionInterpolator: new FlyToInterpolator()
                }));
            }
        }
        else {
            // Reset or keep? Maybe keep for now.
        }
    }, [features]); // Trigger on features change (data change)
    // Actions
    const flyToFeature = (id) => {
        const feature = features.find(f => String(f.id) === String(id));
        if (!feature)
            return;
        const bounds = getFeatureBounds(feature);
        if (!bounds)
            return;
        const mapWidth = window.innerWidth - sidePanelWidth;
        const viewport = new WebMercatorViewport({
            width: mapWidth,
            height: window.innerHeight
        });
        const { longitude, latitude, zoom } = viewport.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]], { padding: 100 });
        setViewState(prev => ({
            ...prev,
            longitude,
            latitude,
            zoom,
            transitionDuration: 1000,
            transitionInterpolator: new FlyToInterpolator()
        }));
    };
    return (_jsx(GeoJsonViewerLayout, { sidePanelWidth: sidePanelWidth, onSidePanelWidthChange: setSidePanelWidth, sidePanel: _jsx(SidePanel, { features: features, selectedId: selectedId, highlightedId: highlightedId, searchQuery: searchQuery, onSearchChange: setSearchQuery, onSelect: setSelectedId, onHighlight: setHighlightedId, onDoubleClick: flyToFeature }), mapPanel: _jsx(MapViewer, { data: data, features: features, selectedId: selectedId, highlightedId: highlightedId, viewState: viewState, onSelect: setSelectedId, onHighlight: setHighlightedId, onViewStateChange: setViewState }) }));
};
