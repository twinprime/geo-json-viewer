import type { Feature, GeoJSON } from 'geojson';
export interface ProcessedFeature extends Feature {
    id: string | number;
    properties: Record<string, any>;
}
export declare function processGeoJSON(data: GeoJSON): {
    data: GeoJSON;
    features: ProcessedFeature[];
};
export declare function getFeatureBounds(feature: ProcessedFeature): [number, number, number, number] | null;
export declare function getFeatureLabel(feature: ProcessedFeature): string;
export declare function getCollectionBounds(features: ProcessedFeature[]): [number, number, number, number] | null;
