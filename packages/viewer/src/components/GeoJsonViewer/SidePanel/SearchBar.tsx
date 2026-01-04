import React from "react"

import { Search, X, Code, Regex, AlertCircle } from "lucide-react"
import { type SearchMode } from "../GeoJsonViewer"

interface SearchBarProps {
  searchQuery: string
  searchMode: SearchMode
  searchError: string | null
  onSearchChange: (query: string) => void
  onSearchModeChange: (mode: SearchMode) => void
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  searchMode,
  searchError,
  onSearchChange,
  onSearchModeChange,
}) => {
  return (
    <div className="border-b border-gray-700 bg-gray-900 p-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Search className="flex-none text-gray-400" size={16} />
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={
                searchMode === "regex"
                  ? "Search (Regex supported)..."
                  : 'Search (e.g. name | match("San.*"))...'
              }
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full bg-gray-800 border ${
                searchError ? "border-red-500" : "border-gray-700"
              } rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500 placeholder-gray-500 px-2 py-1 pr-8`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchError && (
                <div title={searchError} className="text-red-500 cursor-help">
                  <AlertCircle size={14} />
                </div>
              )}
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onSearchModeChange("regex")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              searchMode === "regex"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <Regex size={10} />
            Regex
          </button>
          <button
            onClick={() => onSearchModeChange("jexl")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              searchMode === "jexl"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <Code size={10} />
            JEXL
          </button>
        </div>
      </div>
    </div>
  )
}
