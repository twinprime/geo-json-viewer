import React from 'react';
import { type ProcessedFeature } from '../../../utils/geojson';
interface SidePanelProps {
    features: ProcessedFeature[];
    selectedId: string | number | null;
    highlightedId: string | number | null;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSelect: (id: string | number | null) => void;
    onHighlight: (id: string | number | null) => void;
    onDoubleClick: (id: string | number) => void;
}
export declare const SidePanel: React.FC<SidePanelProps>;
export {};
