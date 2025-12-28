import React from 'react';
import { type ProcessedFeature } from '../../../utils/geojson';
interface FileTreeProps {
    features: ProcessedFeature[];
    selectedId: string | number | null;
    highlightedId: string | number | null;
    searchQuery: string;
    onSelect: (id: string | number | null) => void;
    onHighlight: (id: string | number | null) => void;
    onDoubleClick: (id: string | number) => void;
}
export declare const FileTree: React.FC<FileTreeProps>;
export {};
