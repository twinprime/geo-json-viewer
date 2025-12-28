import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
export const GeoJsonViewerLayout = ({ sidePanel, mapPanel, sidePanelWidth, onSidePanelWidthChange }) => {
    const [isDragging, setIsDragging] = useState(false);
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);
    const startResize = (e) => {
        setIsDragging(true);
        startXRef.current = e.clientX;
        startWidthRef.current = sidePanelWidth;
        document.body.style.cursor = 'col-resize';
    };
    useEffect(() => {
        if (!isDragging)
            return;
        const onMouseMove = (e) => {
            const deltaX = e.clientX - startXRef.current;
            const newWidth = Math.max(200, Math.min(startWidthRef.current + deltaX, 800)); // Limits: 200px - 800px
            onSidePanelWidthChange(newWidth);
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
    }, [isDragging, onSidePanelWidthChange]);
    return (_jsxs("div", { className: "flex flex-1 overflow-hidden h-full w-full", children: [_jsxs("div", { className: "border-r border-gray-700 bg-gray-900 flex flex-col shrink-0 relative", style: { width: sidePanelWidth }, children: [sidePanel, _jsx("div", { className: "absolute right-0 top-0 bottom-0 w-1 bg-transparent hover:bg-blue-500 cursor-col-resize z-50 transition-colors", onMouseDown: startResize, style: { right: '-2px', width: '4px' } })] }), _jsx("div", { className: "flex-1 relative bg-gray-800 overflow-hidden", children: mapPanel })] }));
};
