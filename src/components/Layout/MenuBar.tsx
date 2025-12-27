import React, { useRef } from 'react';
import { FolderOpen } from 'lucide-react';
import type { GeoJSON } from 'geojson';

interface MenuBarProps {
  onDataLoad: (data: GeoJSON) => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({ onDataLoad }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const json = JSON.parse(text);
          onDataLoad(json);
        } catch (error) {
          console.error("Failed to parse GeoJSON", error);
          alert("Invalid GeoJSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const onOpenClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="h-12 bg-gray-900 border-b border-gray-700 flex items-center px-4 shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-white mr-4">GeoJSON Viewer</h1>
        <button 
          onClick={onOpenClick}
          className="flex items-center gap-2 px-3 py-1.5 text-sm md:text-base bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          <FolderOpen size={16} />
          Open File
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".json,.geojson" 
          className="hidden" 
        />
      </div>
    </div>
  );
};
