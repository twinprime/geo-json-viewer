import React from "react"
import { SearchBar } from "./SearchBar"
import { FileTree } from "./FileTree"
import { FeatureDetails } from "./FeatureDetails"
import { type ProcessedFeature, type FeatureId } from "../../../utils/geojson"

interface SidePanelProps {
  features: ProcessedFeature[]
  selectedId: FeatureId | null
  highlightedId: FeatureId | null
  searchQuery: string

  onSearchChange: (query: string) => void
  onSelect: (id: FeatureId | null) => void
  onHighlight: (id: FeatureId | null) => void
  onDoubleClick: (id: FeatureId) => void
}

export const SidePanel: React.FC<SidePanelProps> = ({
  features,
  selectedId,
  highlightedId,
  searchQuery,
  onSearchChange,
  onSelect,
  onHighlight,
  onDoubleClick,
}) => {
  const selectedFeature = features.find((f) => f.id === selectedId)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none">
        <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} />
      </div>
      <div className="flex-1 min-h-0 h-full">
        <FileTree
          features={features}
          selectedId={selectedId}
          highlightedId={highlightedId}
          searchQuery={searchQuery}
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
