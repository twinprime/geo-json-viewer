import React from "react"

import { Search } from "lucide-react"

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="border-b border-gray-700 bg-gray-900">
      <div className="flex">
        <Search className="flex-none text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search (Regex supported)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500 placeholder-gray-500"
        />
      </div>
    </div>
  )
}
