import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getFeatureLabel } from '../../../utils/geojson';
export const FeatureDetails = ({ selectedFeature }) => {
    const selectedId = selectedFeature?.id;
    if (!selectedId || !selectedFeature) {
        return (_jsx("div", { className: "h-1/3 bg-gray-900 border-t border-gray-700 p-4 text-sm text-gray-500 flex items-center justify-center italic", children: "Select a feature to view details" }));
    }
    return (_jsxs("div", { className: "h-1/3 min-h-[200px] bg-gray-900 border-t border-gray-700 flex flex-col", children: [_jsx("div", { className: "px-4 py-2 border-b border-gray-800 font-semibold text-gray-200 bg-gray-800/50 truncate", children: selectedFeature ? getFeatureLabel(selectedFeature) : 'Properties' }), _jsx("div", { className: "flex-1 overflow-auto p-4", children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "grid grid-cols-[100px_1fr] gap-2 text-sm border-b border-gray-800 pb-2 mb-2", children: [_jsx("span", { className: "text-gray-500", children: "ID" }), _jsx("span", { className: "font-mono text-gray-300 break-all", children: selectedFeature.id })] }), selectedFeature.properties && Object.entries(selectedFeature.properties).map(([key, value]) => (_jsxs("div", { className: "grid grid-cols-[100px_1fr] gap-2 text-sm", children: [_jsx("span", { className: "text-gray-500 truncate", title: key, children: key }), _jsx("span", { className: "font-mono text-gray-300 break-all", children: typeof value === 'object' ? JSON.stringify(value) : String(value) })] }, key)))] }) })] }));
};
