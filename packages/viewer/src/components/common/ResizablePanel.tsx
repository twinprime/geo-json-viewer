import React, { useState, useEffect, useRef } from "react"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

export type PanelPosition = "left" | "right" | "bottom" | "top"

interface ResizablePanelProps {
  position: PanelPosition
  size: number
  onSizeChange: (size: number) => void
  isExpanded: boolean
  onExpandChange: (expanded: boolean) => void
  minSize?: number
  maxSize?: number
  collapsedSize?: number
  header?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  position,
  size,
  onSizeChange,
  isExpanded,
  onExpandChange,
  minSize = 200,
  maxSize = 800,
  collapsedSize = 40,
  header,
  children,
  className = "",
}) => {
  const [isResizing, setIsResizing] = useState(false)
  const startPosRef = useRef<number>(0)
  const startSizeRef = useRef<number>(0)

  const isVertical = position === "top" || position === "bottom"
  const currentSize = isExpanded ? size : collapsedSize

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsResizing(true)
    startPosRef.current = isVertical ? e.clientY : e.clientX
    startSizeRef.current = size

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = isVertical ? moveEvent.clientY : moveEvent.clientX
      const delta = currentPos - startPosRef.current

      let newSize = startSizeRef.current

      // Calculate new size based on direction
      switch (position) {
        case "left": // Drag right increases
        case "top": // Drag down increases
          newSize += delta
          break
        case "right": // Drag left increases (delta is negative when moving left)
        case "bottom": // Drag up increases (delta is negative when moving up)
          newSize -= delta
          break
      }

      const clampedSize = Math.max(minSize, Math.min(maxSize, newSize))
      onSizeChange(clampedSize)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ""
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.body.style.cursor = isVertical ? "row-resize" : "col-resize"
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Resize Handle Styles
  const getHandleStyle = () => {
    const baseStyle =
      "absolute z-50 bg-transparent hover:bg-blue-500 transition-colors"
    const thickness = "4px"
    const offset = "-2px" // Center the 4px handle over the 1px border

    switch (position) {
      case "left":
        return {
          className: `${baseStyle} cursor-col-resize w-1 top-0 bottom-0`,
          style: { right: offset, width: thickness },
        }
      case "right":
        return {
          className: `${baseStyle} cursor-col-resize w-1 top-0 bottom-0`,
          style: { left: offset, width: thickness },
        }
      case "bottom":
        return {
          className: `${baseStyle} cursor-row-resize h-1 left-0 right-0`,
          style: { top: offset, height: thickness },
        }
      case "top":
        return {
          className: `${baseStyle} cursor-row-resize h-1 left-0 right-0`,
          style: { bottom: offset, height: thickness },
        }
    }
  }

  const handleProps = getHandleStyle()

  // Toggle Button Icon
  const ToggleIcon = () => {
    const size = 16
    if (isExpanded) {
      switch (position) {
        case "bottom":
          return <ChevronDown size={size} />
        case "top":
          return <ChevronUp size={size} />
        case "left":
          return <ChevronLeft size={size} />
        case "right":
          return <ChevronRight size={size} />
      }
    } else {
      switch (position) {
        case "bottom":
          return <ChevronUp size={size} />
        case "top":
          return <ChevronDown size={size} />
        case "left":
          return <ChevronRight size={size} />
        case "right":
          return <ChevronLeft size={size} />
      }
    }
    return null
  }

  return (
    <div
      className={`flex flex-col bg-gray-900 text-white shrink-0 relative ${className} ${
        isResizing ? "" : "transition-all duration-300 ease-in-out"
      }`}
      style={{
        width: isVertical ? "100%" : currentSize,
        height: isVertical ? currentSize : "100%",
      }}
    >
      {/* Resize Handle - Only visible when expanded */}
      {isExpanded && (
        <div
          className={handleProps.className}
          style={handleProps.style}
          onMouseDown={handleMouseDown}
        />
      )}

      {/* Header / Toggle Bar */}
      {header && (
        <button
          className={`flex items-center justify-between px-4 bg-gray-800 cursor-pointer hover:bg-gray-700 select-none border-gray-700 w-full text-left ${
            isVertical ? "h-10 border-b" : "h-10 border-b" // Adjust for vertical/horizontal panels?
          }`}
          // For side panels, maybe the header should be different?
          // If it's a side panel, usually the header is at the top of the panel.
          // But if collapsed, how does it look?
          // If SidePanel collapses to left, maybe we want a vertical bar?
          // For now, let's assume standard top-header for all panels.
          onClick={() => onExpandChange(!isExpanded)}
        >
          <div className="flex items-center gap-2 text-sm font-medium overflow-hidden whitespace-nowrap">
            {header}
          </div>
          <div className="text-gray-400 hover:text-white shrink-0 ml-2">
            <ToggleIcon />
          </div>
        </button>
      )}

      {/* Content */}
      <div
        className={`flex-1 overflow-hidden ${
          isExpanded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="h-full w-full relative">{children}</div>
      </div>
    </div>
  )
}
