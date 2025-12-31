import React, { useState, useRef } from "react"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../utils/cn"

export type PanelPosition = "left" | "right" | "bottom" | "top"

export interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
}

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
  tabs?: Tab[]
  activeTabId?: string
  onTabChange?: (tabId: string) => void
  children?: React.ReactNode
  className?: string
}

interface ToggleIconProps {
  isExpanded: boolean
  position: PanelPosition
}

const ToggleIcon: React.FC<ToggleIconProps> = ({ isExpanded, position }) => {
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

const getHandleStyle = (position: PanelPosition) => {
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

const usePanelResize = (
  position: PanelPosition,
  size: number,
  onSizeChange: (size: number) => void,
  minSize: number,
  maxSize: number
) => {
  const [isResizing, setIsResizing] = useState(false)
  const startPosRef = useRef<number>(0)
  const startSizeRef = useRef<number>(0)

  const isVertical = position === "top" || position === "bottom"

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

  return { isResizing, handleMouseDown }
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
  tabs,
  activeTabId: controlledActiveTabId,
  onTabChange,
  children,
  className = "",
}) => {
  const { isResizing, handleMouseDown } = usePanelResize(
    position,
    size,
    onSizeChange,
    minSize,
    maxSize
  )
  const [internalActiveTabId, setInternalActiveTabId] = useState(
    tabs?.[0]?.id || ""
  )

  const isVertical = position === "top" || position === "bottom"
  const isLeftRight = position === "left" || position === "right"
  const currentSize = isExpanded ? size : collapsedSize

  const activeTabId = controlledActiveTabId ?? internalActiveTabId

  const handleTabClick = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onTabChange) {
      onTabChange(tabId)
    } else {
      setInternalActiveTabId(tabId)
    }
    if (!isExpanded) {
      onExpandChange(true)
    }
  }

  const activeTab = tabs?.find((tab) => tab.id === activeTabId) || tabs?.[0]
  const handleProps = getHandleStyle(position)

  const getContainerClass = () => {
    if (isLeftRight) {
      return position === "right" ? "flex-row-reverse" : "flex-row"
    }
    return "flex-col"
  }

  const getTabButtonClass = (isActive: boolean) => {
    if (isActive) {
      return isVertical
        ? "text-blue-400 border-blue-400 bg-gray-700/30"
        : "text-blue-400 bg-gray-700/50"
    }
    return "text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-700/20"
  }

  return (
    <div
      className={cn(
        "flex bg-gray-900 text-white shrink-0 relative",
        getContainerClass(),
        className,
        !isResizing && "transition-all duration-300 ease-in-out"
      )}
      style={{
        width: isVertical ? "100%" : currentSize,
        height: isVertical ? currentSize : "100%",
      }}
    >
      {/* Resize Handle - Only visible when expanded */}
      {isExpanded && (
        <button
          aria-label="Resize Handle"
          className={cn(
            handleProps.className,
            "border-none p-0 focus:outline-none"
          )}
          style={handleProps.style}
          onMouseDown={handleMouseDown}
        />
      )}

      {/* Header / Toggle Bar */}
      <div
        className={cn(
          "flex items-center justify-between bg-gray-800 select-none border-gray-700",
          isVertical
            ? "h-10 w-full border-b flex-row"
            : "w-10 h-full border-r flex-col"
        )}
      >
        {/* Toggle Button (Top for vertical layout) */}
        {isLeftRight && (
          <button
            className="w-full h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer border-b border-gray-700"
            onClick={() => onExpandChange(!isExpanded)}
          >
            <ToggleIcon isExpanded={isExpanded} position={position} />
          </button>
        )}

        {/* Tabs or Header Content */}
        <div
          className={cn(
            "flex-1 flex overflow-hidden",
            isVertical
              ? "items-center h-full"
              : "flex-col w-full items-center py-2 gap-2"
          )}
        >
          {tabs ? (
            <div
              className={cn(
                "flex",
                isVertical ? "h-full" : "flex-col w-full items-center gap-2"
              )}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={(e) => handleTabClick(tab.id, e)}
                  title={isLeftRight ? tab.label : undefined}
                  className={cn(
                    "text-sm font-medium transition-colors focus:outline-none flex items-center justify-center",
                    isVertical
                      ? "px-3 py-1 gap-2 h-full border-b-2"
                      : "w-8 h-8 rounded-md",
                    getTabButtonClass(activeTabId === tab.id && isExpanded)
                  )}
                >
                  {tab.icon}
                  {isVertical && <span>{tab.label}</span>}
                </button>
              ))}
            </div>
          ) : (
            <button
              className={cn(
                "flex items-center gap-2 px-4 text-sm font-medium overflow-hidden whitespace-nowrap w-full h-full cursor-pointer hover:bg-gray-700 border-none bg-transparent p-0 text-inherit",
                isLeftRight &&
                  "justify-center [writing-mode:vertical-lr] rotate-180"
              )}
              onClick={() => onExpandChange(!isExpanded)}
            >
              {header}
            </button>
          )}
        </div>

        {/* Toggle Button (Right for horizontal layout) */}
        {isVertical && (
          <button
            className="h-full px-3 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer border-l border-gray-700"
            onClick={() => onExpandChange(!isExpanded)}
          >
            <ToggleIcon isExpanded={isExpanded} position={position} />
          </button>
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 overflow-hidden",
          isExpanded ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="h-full w-full relative">
          {tabs ? activeTab?.content : children}
        </div>
      </div>
    </div>
  )
}
