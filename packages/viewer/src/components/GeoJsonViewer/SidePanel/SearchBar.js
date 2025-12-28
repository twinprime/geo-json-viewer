import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Search } from 'lucide-react';
export const SearchBar = ({ searchQuery, onSearchChange }) => {
    return (_jsx("div", { className: "p-4 border-b border-gray-700 bg-gray-900 sticky top-0 z-10", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400", size: 16 }), _jsx("input", { type: "text", placeholder: "Search (Regex supported)...", value: searchQuery, onChange: (e) => onSearchChange(e.target.value), className: "w-full bg-gray-800 border border-gray-700 rounded pl-10 pr-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 placeholder-gray-500" })] }) }));
};
