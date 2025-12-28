import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SearchBar } from './SearchBar';
import { FileTree } from './FileTree';
import { FeatureDetails } from './FeatureDetails';
export const SidePanel = ({ features, selectedId, highlightedId, searchQuery, onSearchChange, onSelect, onHighlight, onDoubleClick }) => {
    const selectedFeature = features.find(f => f.id === selectedId);
    return (_jsxs("div", { className: "flex flex-col h-full", children: [_jsx(SearchBar, { searchQuery: searchQuery, onSearchChange: onSearchChange }), _jsx(FileTree, { features: features, selectedId: selectedId, highlightedId: highlightedId, searchQuery: searchQuery, onSelect: onSelect, onHighlight: onHighlight, onDoubleClick: onDoubleClick }), _jsx(FeatureDetails, { selectedFeature: selectedFeature })] }));
};
