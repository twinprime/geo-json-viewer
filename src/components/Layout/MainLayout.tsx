import React, { type ReactNode, useEffect, useRef, useState } from 'react';
import { MenuBar } from './MenuBar';
import { useAppStore } from '../../store/useAppStore';

interface MainLayoutProps {
  sidePanel: ReactNode;
  mapPanel: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ sidePanel, mapPanel }) => {
  const { sidePanelWidth, setSidePanelWidth } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const startResize = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = sidePanelWidth;
    document.body.style.cursor = 'col-resize';
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.max(200, Math.min(startWidthRef.current + deltaX, 800)); // Limits: 200px - 800px
      setSidePanelWidth(newWidth);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, setSidePanelWidth]);

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 text-white overflow-hidden">
      <MenuBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Resizable */}
        <div 
          className="border-r border-gray-700 bg-gray-900 flex flex-col shrink-0 relative"
          style={{ width: sidePanelWidth }}
        >
          {sidePanel}
          
          {/* Resizer Handle */}
          <div 
             className="absolute right-0 top-0 bottom-0 w-1 bg-transparent hover:bg-blue-500 cursor-col-resize z-50 transition-colors"
             onMouseDown={startResize}
             style={{ right: '-2px', width: '4px' }} // Slightly wider capture area
          />
        </div>
        
        {/* Right Panel: Map View */}
        <div className="flex-1 relative bg-gray-800 overflow-hidden">
          {mapPanel}
        </div>
      </div>
    </div>
  );
};
