import { create } from 'zustand';
import type { GeoJSON } from 'geojson';
import { processGeoJSON, getFeatureBounds, getCollectionBounds, type ProcessedFeature } from '../utils/geojson';
import { WebMercatorViewport } from '@math.gl/web-mercator';
import { FlyToInterpolator } from '@deck.gl/core';

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  transitionDuration?: number | 'auto';
  transitionInterpolator?: any;
}

const INITIAL_VIEW_STATE: ViewState = {
  longitude: 103.8198,
  latitude: 1.3521,
  zoom: 11,
  pitch: 0,
  bearing: 0
};

interface AppState {
  data: GeoJSON | null;
  features: ProcessedFeature[];
  selectedId: string | number | null;
  highlightedId: string | number | null;
  searchQuery: string;
  viewState: ViewState;
  sidePanelWidth: number;

  loadData: (data: GeoJSON) => void;
  selectFeature: (id: string | number | null) => void;
  highlightFeature: (id: string | number | null) => void;
  setSearchQuery: (query: string) => void;
  setViewState: (viewState: ViewState) => void;
  setSidePanelWidth: (width: number) => void;
  flyToFeature: (id: string | number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  data: null,
  features: [],
  selectedId: null,
  highlightedId: null,
  searchQuery: '',
  viewState: INITIAL_VIEW_STATE,
  sidePanelWidth: 320,

  loadData: (rawData: GeoJSON) => {
    const { data, features } = processGeoJSON(rawData);
    
    // Calculate bounds and fit view
    const bounds = getCollectionBounds(features);
    let viewStateUpdate = {};

    if (bounds) {
       const { sidePanelWidth } = get();
       // Calculate map width based on layout constraints
       const mapWidth = window.innerWidth - sidePanelWidth;
       
       const viewport = new WebMercatorViewport({
           width: mapWidth, 
           height: window.innerHeight 
       });
 
       const { longitude, latitude, zoom } = viewport.fitBounds(
           [[bounds[0], bounds[1]], [bounds[2], bounds[3]]],
           { padding: 50 }
       );

       viewStateUpdate = {
           longitude,
           latitude,
           zoom: Math.min(zoom, 18), // Cap max zoom
           transitionDuration: 1000,
           transitionInterpolator: new FlyToInterpolator()
       };
    }

    set((state) => ({ 
        data, 
        features, 
        selectedId: null, 
        highlightedId: null, 
        searchQuery: '',
        viewState: {
            ...state.viewState,
            ...viewStateUpdate
        }
    }));
  },

  selectFeature: (id) => set({ selectedId: id }),
  highlightFeature: (id) => set({ highlightedId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setViewState: (viewState) => set({ viewState }),
  setSidePanelWidth: (width) => set({ sidePanelWidth: width }),
  
  flyToFeature: (id) => {
      const { features, sidePanelWidth } = get();
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

      set((state) => ({
          viewState: {
              ...state.viewState,
              longitude,
              latitude,
              zoom,
              transitionDuration: 1000,
              transitionInterpolator: new FlyToInterpolator() 
          }
      }));
  }
}));
