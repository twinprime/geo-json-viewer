import React from "react"

import { Search, X } from "lucide-react"

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="border-b border-gray-700 bg-gray-900 p-2">
      <div className="flex items-center gap-2">
        <Search className="flex-none text-gray-400" size={16} />
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search (Regex supported)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500 placeholder-gray-500 px-2 py-1 pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
