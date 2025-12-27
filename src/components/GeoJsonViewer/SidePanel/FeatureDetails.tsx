import React from 'react';
import { type ProcessedFeature, getFeatureLabel } from '../../../utils/geojson';

interface FeatureDetailsProps {
  selectedFeature: ProcessedFeature | undefined;
}

export const FeatureDetails: React.FC<FeatureDetailsProps> = ({ selectedFeature }) => {
  const selectedId = selectedFeature?.id;

  if (!selectedId || !selectedFeature) {
    return (
      <div className="h-1/3 bg-gray-900 border-t border-gray-700 p-4 text-sm text-gray-500 flex items-center justify-center italic">
        Select a feature to view details
      </div>
    );
  }

  return (
    <div className="h-1/3 min-h-[200px] bg-gray-900 border-t border-gray-700 flex flex-col">
       <div className="px-4 py-2 border-b border-gray-800 font-semibold text-gray-200 bg-gray-800/50 truncate">
        {selectedFeature ? getFeatureLabel(selectedFeature) : 'Properties'}
       </div>
       <div className="flex-1 overflow-auto p-4">
         <div className="space-y-2">
            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm border-b border-gray-800 pb-2 mb-2">
               <span className="text-gray-500">ID</span>
               <span className="font-mono text-gray-300 break-all">{selectedFeature.id}</span>
            </div>
            {selectedFeature.properties && Object.entries(selectedFeature.properties).map(([key, value]) => (
                 <div key={key} className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                 <span className="text-gray-500 truncate" title={key}>{key}</span>
                 <span className="font-mono text-gray-300 break-all">
                   {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                 </span>
              </div>
            ))}
         </div>
       </div>
    </div>
  );
};
