"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";
import { DiffControlMode } from "../types";
import { getModeLabel } from "../utils/diffUtils";

interface ModeSelectorProps {
  activeMode: DiffControlMode;
  onModeChange: (mode: DiffControlMode) => void;
}

/**
 * Dropdown menu for selecting the diff display mode
 */
export function ModeSelector({ activeMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex justify-end mt-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Settings className="h-3.5 w-3.5 mr-1" />
            Display mode:{" "}
            <span className="font-medium ml-1">{getModeLabel(activeMode)}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onModeChange("highlightFloating")}>
            Highlight + Floating
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onModeChange("wordBoundary")}>
            Word Boundary
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onModeChange("sideAnnotations")}>
            Side Annotations
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onModeChange("tooltip")}>
            Tooltip Controls
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onModeChange("changeBubbles")}>
            Change Bubbles
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
