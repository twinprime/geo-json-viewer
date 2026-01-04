import React, { memo } from "react"
import { SearchBar } from "./SearchBar"
import { FileTree } from "./FileTree"
import { FeatureDetails } from "./FeatureDetails"
import { type ProcessedFeature, type FeatureId } from "../../../utils/geojson"
import { type SearchMode } from "../GeoJsonViewer"

interface SidePanelProps {
  features: ProcessedFeature[]
  selectedId: FeatureId | null
  highlightedId: FeatureId | null
  searchQuery: string
  searchMode: SearchMode
  searchError: string | null

  onSearchChange: (query: string) => void
  onSearchModeChange: (mode: SearchMode) => void
  onSelect: (id: FeatureId | null) => void
  onHighlight: (id: FeatureId | null) => void
  onDoubleClick: (id: FeatureId) => void
}

export const SidePanel: React.FC<SidePanelProps> = memo(
  ({
    features,
    selectedId,
    highlightedId,
    searchQuery,
    searchMode,
    searchError,
    onSearchChange,
    onSearchModeChange,
    onSelect,
    onHighlight,
    onDoubleClick,
  }) => {
    const selectedFeature = features.find((f) => f.id === selectedId)

    return (
      <div className="flex flex-col h-full">
        <div className="flex-none">
          <SearchBar
            searchQuery={searchQuery}
            searchMode={searchMode}
            searchError={searchError}
            onSearchChange={onSearchChange}
            onSearchModeChange={onSearchModeChange}
          />
        </div>
        <div className="flex-1 min-h-0 h-full">
          <FileTree
            features={features}
            selectedId={selectedId}
            highlightedId={highlightedId}
            isSearchActive={!!searchQuery}
            onSelect={onSelect}
            onHighlight={onHighlight}
            onDoubleClick={onDoubleClick}
          />
        </div>
        <div className="flex-none">
          <FeatureDetails selectedFeature={selectedFeature} />
        </div>
      </div>
    )
  }
)
