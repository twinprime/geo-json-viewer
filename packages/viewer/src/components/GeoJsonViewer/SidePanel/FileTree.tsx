import React, { useEffect, useRef, memo } from "react"
import { cn } from "../../../utils/cn"
import {
  getFeatureLabel,
  type ProcessedFeature,
  type FeatureId,
} from "../../../utils/geojson"
import { ChevronRight } from "lucide-react"

interface FileTreeProps {
  features: ProcessedFeature[]
  selectedId: FeatureId | null
  highlightedId: FeatureId | null
  isSearchActive: boolean
  onSelect: (id: FeatureId | null) => void
  onHighlight: (id: FeatureId | null) => void
  onDoubleClick: (id: FeatureId) => void
}

export const FileTree: React.FC<FileTreeProps> = memo(
  ({
    features,
    selectedId,
    highlightedId,
    isSearchActive,
    onSelect,
    onHighlight,
    onDoubleClick,
  }) => {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (selectedId && containerRef.current) {
        const element = containerRef.current.querySelector(
          `[data-id="${selectedId}"]`
        )
        if (element) {
          element.scrollIntoView({ block: "center", behavior: "smooth" })
        }
      }
    }, [selectedId])

    if (features.length === 0) {
      return (
        <div className="p-4 text-gray-500 text-sm text-center">
          {isSearchActive ? "No matches found" : "No data loaded"}
        </div>
      )
    }

    return (
      <div
        ref={containerRef}
        className="flex flex-col max-h-full overflow-y-auto m-2"
      >
        {features.map((feature) => (
          <button
            key={feature.id}
            type="button"
            data-id={feature.id}
            className={cn(
              "flex w-full max-w-full text-center outline-none",
              selectedId === feature.id
                ? "bg-blue-600/30 text-blue-200 hover:bg-blue-600/40"
                : "hover:bg-gray-800 text-gray-300",
              highlightedId === feature.id &&
                selectedId !== feature.id &&
                "bg-gray-800"
            )}
            onClick={() => onSelect(feature.id)}
            onDoubleClick={() => onDoubleClick(feature.id)}
            onMouseEnter={() => onHighlight(feature.id)}
            onMouseLeave={() => onHighlight(null)}
          >
            <span className="truncate flex-1">{getFeatureLabel(feature)}</span>
            {selectedId === feature.id && <ChevronRight size={14} />}
          </button>
        ))}
      </div>
    )
  }
)
