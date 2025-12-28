import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { getFeatureLabel } from '../../../utils/geojson';
import { ChevronRight, MapPin } from 'lucide-react';
export const FileTree = ({ features, selectedId, highlightedId, searchQuery, onSelect, onHighlight, onDoubleClick }) => {
    const filteredFeatures = useMemo(() => {
        if (!searchQuery)
            return features;
        try {
            const regex = new RegExp(searchQuery, 'i');
            return features.filter(f => {
                // Match against ID
                if (regex.test(String(f.id)))
                    return true;
                // Match against properties
                if (f.properties) {
                    return Object.entries(f.properties).some(([key, value]) => regex.test(key) || regex.test(String(value)));
                }
                return false;
            });
        }
        catch (e) {
            // Invalid regex, return empty or all? Let's return empty to indicate error
            return [];
        }
    }, [features, searchQuery]);
    if (features.length === 0) {
        return _jsx("div", { className: "p-4 text-gray-500 text-sm text-center", children: "No data loaded" });
    }
    return (_jsxs("div", { className: "flex-1 overflow-y-auto", children: [filteredFeatures.map((feature) => (_jsxs("div", { className: cn("flex items-center gap-2 px-4 py-2 cursor-pointer text-sm transition-colors border-b border-gray-800 last:border-0", selectedId === feature.id ? "bg-blue-600/30 text-blue-200 hover:bg-blue-600/40" : "hover:bg-gray-800 text-gray-300", highlightedId === feature.id && selectedId !== feature.id && "bg-gray-800"), onClick: () => onSelect(feature.id), onDoubleClick: () => onDoubleClick(feature.id), onMouseEnter: () => onHighlight(feature.id), onMouseLeave: () => onHighlight(null), children: [_jsx(MapPin, { size: 14, className: selectedId === feature.id ? "text-blue-400" : "text-gray-500" }), _jsx("span", { className: "truncate flex-1", children: getFeatureLabel(feature) }), selectedId === feature.id && _jsx(ChevronRight, { size: 14 })] }, feature.id))), filteredFeatures.length === 0 && searchQuery && (_jsx("div", { className: "p-4 text-gray-500 text-center text-sm", children: "No matches found" }))] }));
};
