import React, { useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { getFeatureLabel, type ProcessedFeature } from '../../../utils/geojson';
import { ChevronRight, MapPin } from 'lucide-react';

interface FileTreeProps {
  features: ProcessedFeature[];
  selectedId: string | number | null;
  highlightedId: string | number | null;
  searchQuery: string;
  onSelect: (id: string | number | null) => void;
  onHighlight: (id: string | number | null) => void;
  onDoubleClick: (id: string | number) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({ 
  features, 
  selectedId, 
  highlightedId, 
  searchQuery, 
  onSelect, 
  onHighlight, 
  onDoubleClick 
}) => {

  const filteredFeatures = useMemo(() => {
    if (!searchQuery) return features;
    
    try {
      const regex = new RegExp(searchQuery, 'i');
      return features.filter(f => {
        // Match against ID
        if (regex.test(String(f.id))) return true;
        // Match against properties
        if (f.properties) {
          return Object.entries(f.properties).some(([key, value]) => 
            regex.test(key) || regex.test(String(value))
          );
        }
        return false;
      });
    } catch (e) {
      // Invalid regex, return empty or all? Let's return empty to indicate error
      return [];
    }
  }, [features, searchQuery]);

  if (features.length === 0) {
    return <div className="p-4 text-gray-500 text-sm text-center">No data loaded</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {filteredFeatures.map((feature) => (
        <div 
          key={feature.id}
          className={cn(
            "flex items-center gap-2 px-4 py-2 cursor-pointer text-sm transition-colors border-b border-gray-800 last:border-0",
            selectedId === feature.id ? "bg-blue-600/30 text-blue-200 hover:bg-blue-600/40" : "hover:bg-gray-800 text-gray-300",
            highlightedId === feature.id && selectedId !== feature.id && "bg-gray-800"
          )}
          onClick={() => onSelect(feature.id)}
          onDoubleClick={() => onDoubleClick(feature.id)}
          onMouseEnter={() => onHighlight(feature.id)}
          onMouseLeave={() => onHighlight(null)}
        >
          <MapPin size={14} className={selectedId === feature.id ? "text-blue-400" : "text-gray-500"} />
          <span className="truncate flex-1">
            {getFeatureLabel(feature)}
          </span>
          {selectedId === feature.id && <ChevronRight size={14} />}
        </div>
      ))}
      {filteredFeatures.length === 0 && searchQuery && (
        <div className="p-4 text-gray-500 text-center text-sm">No matches found</div>
      )}
    </div>
  );
};
