"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface ResizablePanelProps {
  children: React.ReactNode
  defaultWidth: number
  minWidth: number
  maxWidth: number
  side: "left" | "right"
  className?: string
  storageKey?: string
}

export default function ResizablePanel({
  children,
  defaultWidth,
  minWidth,
  maxWidth,
  side,
  className,
  storageKey,
}: ResizablePanelProps) {
  // Initialize width from localStorage if available
  const getInitialWidth = () => {
    if (typeof window !== 'undefined' && storageKey) {
      const savedWidth = localStorage.getItem(`resizable-panel-${storageKey}`);
      if (savedWidth) {
        const parsedWidth = parseInt(savedWidth, 10);
        if (!isNaN(parsedWidth) && parsedWidth >= minWidth && parsedWidth <= maxWidth) {
          return parsedWidth;
        }
      }
    }
    return defaultWidth;
  };

  const [width, setWidth] = useState(defaultWidth); // Initialize with default, will be updated in useEffect
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(defaultWidth)

  // Load saved width on mount
  useEffect(() => {
    setWidth(getInitialWidth());
  }, []);

  // Save width to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && storageKey && !isResizing) {
      localStorage.setItem(`resizable-panel-${storageKey}`, width.toString());
    }
  }, [width, isResizing, storageKey]);

  // Handle mouse down on the resize handle
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = width
  }

  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const delta = e.clientX - startXRef.current
      let newWidth = side === "left" ? startWidthRef.current + delta : startWidthRef.current - delta

      // Constrain width to min/max values
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, minWidth, maxWidth, side])

  return (
    <div ref={panelRef} className={cn("relative flex flex-col h-full", className)} style={{ width: `${width}px` }}>
      {children}
      <div
        className={cn(
          "absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors",
          side === "left" ? "right-0" : "left-0",
        )}
        onMouseDown={handleMouseDown}
      />
    </div>
  )
}
