import React, { type ReactNode } from 'react';
interface GeoJsonViewerLayoutProps {
    sidePanel: ReactNode;
    mapPanel: ReactNode;
    sidePanelWidth: number;
    onSidePanelWidthChange: (width: number) => void;
}
export declare const GeoJsonViewerLayout: React.FC<GeoJsonViewerLayoutProps>;
export {};
